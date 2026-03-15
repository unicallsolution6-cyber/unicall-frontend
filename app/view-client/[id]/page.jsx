"use client"

import ViewClient from "@/app/components/view-client/Index"

export default function ViewClientPage({ params }) {
  return <ViewClient clientId={params.id} />
}
