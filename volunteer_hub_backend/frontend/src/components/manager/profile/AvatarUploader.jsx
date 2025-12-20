import React, { useRef, useState } from 'react'

export default function AvatarUploader({ initialPreview, onChange }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(initialPreview || null)

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setPreview(url)
    onChange && onChange(f, url)
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border">
          <img src={preview || 'https://cdn.shadcnstudio.com/ss-assets/components/avatar/avatar-1.png'} alt="avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-1 rounded border">Chọn ảnh</button>
        </div>
      </div>
    </div>
  )
}
