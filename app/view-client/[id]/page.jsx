"use client"

import { use } from "react"
import ViewClient from "@/app/components/view-client/Index"

export default function ViewClientPage({ params }) {
  // In Next.js 16, `params` is a Promise and must be unwrapped with `use()`
  const { id } = use(params)
  return <ViewClient clientId={id} />
}
