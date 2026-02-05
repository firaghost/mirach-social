import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

// LinkedIn API configuration
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN // We'll store this in env for now

export async function POST(request: NextRequest) {
  console.log('POST /api/post-linkedin invoked')
  try {
    const { postId } = await request.json()
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }
    
    const supabaseAdmin = createSupabaseAdmin()

    // Optional per-user token selection
    const userId = request.nextUrl.searchParams.get('user_id') || request.headers.get('x-user-id') || null

    // Read latest LinkedIn token from DB (server-side)
    let token: string | undefined = process.env.LINKEDIN_ACCESS_TOKEN
    try {
      let query = supabaseAdmin.from('linkedin_tokens').select('*').order('created_at', { ascending: false }).limit(1)
      if (userId) query = query.eq('user_id', userId)

      const { data: tokens, error: tokenError } = await query

      if (tokenError) {
        console.error('Error querying linkedin_tokens:', tokenError)
      } else if (tokens && tokens.length > 0) {
        const row = tokens[0]
        if (row.access_token && (!row.expires_at || new Date(row.expires_at) > new Date())) {
          token = row.access_token
        }
      }
    } catch (err) {
      console.error('Exception reading linkedin_tokens:', err)
    }

    if (!token) {
      return NextResponse.json(
        { error: 'LinkedIn not connected. Please connect via OAuth.' },
        { status: 400 }
      )
    }

    // Get post from database with media
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        media (*)
      `)
      .eq('id', postId)
      .single()
    
    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Get user's LinkedIn URN (Universal Resource Name)
    const userInfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json()
      console.error('LinkedIn user info error:', errorData)
      return NextResponse.json(
        { error: 'Failed to get LinkedIn user info. Token may be expired.' },
        { status: 401 }
      )
    }
    
    const userInfo = await userInfoResponse.json()
    const author = `urn:li:person:${userInfo.sub}`
    
    // Prepare the post
    const postBody: any = {
      author: author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }
    
    // If there are images, handle them
    if (post.media && post.media.length > 0) {
      postBody.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
      
      // Upload images to LinkedIn and get asset URNs
      const mediaAssets = []
      for (const media of post.media) {
        // For now, we'd need to implement image upload to LinkedIn
        // This requires: 1) Register upload, 2) Upload image, 3) Get asset URN
        // Skipping for MVP - focus on text posts first
      }
    }
    
    // Post to LinkedIn
    const linkedInResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postBody)
    })
    
    if (!linkedInResponse.ok) {
      const errorData = await linkedInResponse.json()
      console.error('LinkedIn API error:', errorData)
      
      // Log the failure
      await supabaseAdmin
        .from('posting_logs')
        .insert([{
          post_id: postId,
          action: 'failed',
          message: `LinkedIn API error: ${JSON.stringify(errorData)}`
        }])
      
      return NextResponse.json(
        { error: 'Failed to post to LinkedIn: ' + (errorData.message || 'Unknown error') },
        { status: 500 }
      )
    }
    
    const linkedInData = await linkedInResponse.json()
    
    // Update post status
    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
        platform_post_id: linkedInData.id
      })
      .eq('id', postId)
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Posted to LinkedIn but failed to update database' },
        { status: 500 }
      )
    }
    
    // Log the success
    await supabaseAdmin
      .from('posting_logs')
      .insert([{
        post_id: postId,
        action: 'posted',
        message: `Posted to LinkedIn successfully. Post ID: ${linkedInData.id}`
      }])
    
    return NextResponse.json({
      success: true,
      message: 'Posted to LinkedIn successfully!',
      linkedInPostId: linkedInData.id
    })
    
  } catch (error: any) {
    console.error('Error posting to LinkedIn:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, route: 'post-linkedin', methods: ['GET','POST'] })
}
