import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.102.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// Create Document — creates a real Notion page and links it to a venture
// ---------------------------------------------------------------------------

const NOTION_TOKEN = Deno.env.get('NOTION_TOKEN')!
const NOTION_ROOT_PAGE = Deno.env.get('NOTION_ROOT_PAGE') ?? '2e398e40-b332-8081-8453-d5e133106de9'
const NOTION_VERSION = '2022-06-28'
const USER_ID = '00000000-0000-0000-0000-000000000001'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { venture_id, venture_name, title, doc_type, icon } = await req.json()

    if (!venture_id || !title) {
      return new Response(
        JSON.stringify({ error: 'venture_id and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const pageTitle = venture_name ? `${venture_name} — ${title}` : title

    // Create Notion page
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { page_id: NOTION_ROOT_PAGE },
        icon: icon ? { type: 'emoji', emoji: icon } : { type: 'emoji', emoji: '📄' },
        properties: {
          title: {
            title: [{ text: { content: pageTitle } }],
          },
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: 'Overview' } }],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: '' } }],
            },
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: 'Requirements' } }],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: '' } }],
            },
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: 'Notes' } }],
            },
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: '' } }],
            },
          },
        ],
      }),
    })

    if (!notionRes.ok) {
      const err = await notionRes.text()
      return new Response(
        JSON.stringify({ error: 'Notion API failed', detail: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const notionPage = await notionRes.json()
    const notionUrl = notionPage.url

    // Insert venture_files record
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: file, error: fileErr } = await supabase
      .from('venture_files')
      .insert({
        venture_id,
        user_id: USER_ID,
        label: title,
        file_type: 'external_link',
        url: notionUrl,
        sort_order: 0,
      })
      .select('id, url, label')
      .single()

    if (fileErr) {
      return new Response(
        JSON.stringify({ error: 'Failed to save file record', detail: fileErr.message, notion_url: notionUrl }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({
        file_id: file.id,
        url: notionUrl,
        label: title,
        notion_page_id: notionPage.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal error', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
