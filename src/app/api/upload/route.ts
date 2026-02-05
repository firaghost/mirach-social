import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const postId = formData.get('postId') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filePath = `posts/${filename}`
    
    const supabaseAdmin = createSupabaseAdmin()

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file: ' + uploadError.message },
        { status: 500 }
      )
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('media')
      .getPublicUrl(filePath)
    
    // If postId provided, link to post
    if (postId) {
      const { error: dbError } = await supabaseAdmin
        .from('media')
        .insert([{
          post_id: postId,
          file_path: publicUrl,
          file_type: 'image'
        }])
      
      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to save media record' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filePath: filePath
    })
    
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
