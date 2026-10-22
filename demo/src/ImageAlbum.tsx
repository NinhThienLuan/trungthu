import { DeleteOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Alert, Button, Typography, Upload } from 'antd'
import { ProductGallery } from './ProductGallery'

const MAX_BYTES = 400_000
const MAX_IMAGES = 10

export function ImageAlbum({
  images,
  onChange,
}: {
  images: string[]
  onChange?: (images: string[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const editable = Boolean(onChange)
  const current = images.length === 0 ? 0 : Math.min(index, images.length - 1)

  function addFiles(files: File[]) {
    if (!onChange || !files.length) return
    setMessage('')
    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      setMessage('Một sản phẩm có tối đa 10 ảnh.')
      return
    }
    const accepted = files.slice(0, room)
    if (accepted.length < files.length) {
      setMessage('Chỉ nhận thêm đủ 10 ảnh.')
    }
    const tooBig = accepted.find((file) => file.size > MAX_BYTES)
    if (tooBig) {
      setMessage('Mỗi ảnh cần nhỏ hơn 400 KB.')
      return
    }
    if (accepted.some((file) => !file.type.startsWith('image/'))) {
      setMessage('Chỉ nhận file ảnh.')
      return
    }
    Promise.all(accepted.map(readFile)).then((urls) => {
      onChange([...images, ...urls])
      setIndex(images.length)
    })
  }

  function move(from: number, to: number) {
    if (!onChange || from === to || from < 0 || to < 0 || from >= images.length || to >= images.length) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
    setIndex(to)
  }

  return (
    <div>
      <ProductGallery images={images} index={current} onIndexChange={setIndex} />
      {editable && (
        <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
          Kéo tay cầm để sắp xếp. Ảnh đầu tiên là ảnh chính. Tối đa 10 ảnh.
        </Typography.Paragraph>
      )}
      {message && <Alert type="error" showIcon message={message} style={{ marginBottom: 12 }} />}
      {editable && (
        <div className="thumbs">
          {images.map((image, imageIndex) => (
            <div
              key={`${imageIndex}-${image.slice(0, 24)}`}
              className={imageIndex === current ? 'thumb active' : 'thumb'}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null) move(dragFrom, imageIndex)
                setDragFrom(null)
              }}
            >
              <button
                type="button"
                className="thumb-grip"
                draggable
                aria-label="Kéo để sắp xếp"
                onDragStart={() => setDragFrom(imageIndex)}
                onClick={() => setIndex(imageIndex)}
              >
                <HolderOutlined />
              </button>
              <img src={image} alt="" onClick={() => setIndex(imageIndex)} />
              <span>{imageIndex === 0 ? 'Ảnh chính' : `Thứ ${imageIndex + 1}`}</span>
              <Button
                type="link"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onChange?.(images.filter((_, item) => item !== imageIndex))}
              >
                Xóa
              </Button>
            </div>
          ))}
        </div>
      )}
      {editable && images.length < MAX_IMAGES && (
        <Upload
          accept="image/*"
          multiple
          showUploadList={false}
          beforeUpload={(file, fileList) => {
            if (file === fileList[fileList.length - 1]) addFiles(fileList)
            return Upload.LIST_IGNORE
          }}
        >
          <Button icon={<PlusOutlined />}>Thêm ảnh</Button>
        </Upload>
      )}
    </div>
  )
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
