// This file is no longer used - NextAuth has been removed
// Authentication is now handled via secret code only in the frontend
// See app/components/LoginButton.tsx and app/store/useAuthStore.ts

export async function GET() {
  return new Response(JSON.stringify({ message: 'NextAuth endpoint removed' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'NextAuth endpoint removed' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
