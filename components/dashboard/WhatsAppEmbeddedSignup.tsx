"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    FB: {
      init: (params: object) => void
      login: (callback: (r: FBResponse) => void, options: object) => void
    }
    fbAsyncInit: () => void
  }
}

interface FBResponse {
  authResponse?: { code: string }
  status: string
}

interface SessionInfo {
  phone_number_id?: string
  waba_id?: string
}

interface Props {
  onSuccess: (phoneNumberId: string, phoneNumber: string) => void
  onError: (msg: string) => void
  disabled?: boolean
}

export default function WhatsAppEmbeddedSignup({ onSuccess, onError, disabled }: Props) {
  const [loading, setLoading] = useState(false)
  const sessionRef = useRef<SessionInfo>({})

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      )
        return
      try {
        const data = JSON.parse(event.data as string)
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          sessionRef.current = data.data as SessionInfo
        }
      } catch {
        // not JSON, ignore
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  const loadSDK = (appId: string): Promise<void> =>
    new Promise((resolve) => {
      if (window.FB) {
        resolve()
        return
      }
      window.fbAsyncInit = () => {
        window.FB.init({ appId, version: "v18.0", xfbml: true, cookie: true })
        resolve()
      }
      const s = document.createElement("script")
      s.src = "https://connect.facebook.net/en_US/sdk.js"
      s.async = true
      document.body.appendChild(s)
    })

  const handleClick = async () => {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID

    if (!appId || !configId) {
      onError("Meta App ID / Config ID henüz ayarlanmamış. Lütfen manuel formu kullanın.")
      return
    }

    setLoading(true)
    sessionRef.current = {}

    try {
      await loadSDK(appId)
      window.FB.login(
        async (response) => {
          if (!response.authResponse?.code) {
            onError("Bağlantı iptal edildi.")
            setLoading(false)
            return
          }
          try {
            const res = await fetch("/api/meta/exchange-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: response.authResponse.code,
                phoneNumberId: sessionRef.current.phone_number_id ?? "",
              }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? "Bağlantı başarısız")
            onSuccess(json.phoneNumberId, json.phoneNumber ?? "")
          } catch (err) {
            onError(err instanceof Error ? err.message : "Hata")
          }
          setLoading(false)
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "",
            sessionInfoVersion: "2",
          },
        }
      )
    } catch {
      onError("Facebook SDK yüklenemedi.")
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className="gap-2 text-white font-semibold"
      style={{ background: "#25D366" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {loading ? "Bağlanıyor..." : "WhatsApp ile Bağla"}
    </Button>
  )
}
