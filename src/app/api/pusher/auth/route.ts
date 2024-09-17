import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import pusher from '@/lib/pusherServer'

export async function POST(request: Request) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.text()
  const params = new URLSearchParams(body)
  const socket_id = params.get('socket_id')
  const channel_name = params.get('channel_name')

  if (!socket_id || !channel_name) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 })
  }

  const authResponse = pusher.authorizeChannel(socket_id, channel_name)

  return NextResponse.json(authResponse)
}