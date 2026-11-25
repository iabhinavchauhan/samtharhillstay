import { useState } from 'react'
import { Plus, Trash2, FileText, ImagePlus } from 'lucide-react'
import ImagePickerModal from './ImagePickerModal'

const createPost = () => ({
  title: 'New story from Samthar',
  slug: `story-${Date.now()}`,
  date: new Date().toISOString().slice(0, 10),
  excerpt: '',
  image: '',
  content: '',
})

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function BlogManager({ content, onChange }) {
  const [imagePickerIndex, setImagePickerIndex] = useState(null)
  const posts = content.blogs || []
  const updatePosts = (nextPosts) => onChange({ ...content, blogs: nextPosts })

  const updatePost = (index, key, value) => {
    const nextPosts = [...posts]
    nextPosts[index] = {
      ...nextPosts[index],
      [key]: value,
      ...(key === 'title' ? { slug: slugify(value) || nextPosts[index].slug } : {}),
    }
    updatePosts(nextPosts)
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#10281e] p-5">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold text-white"><FileText className="h-5 w-5 text-[#caa34b]" />Blog Posts</h1>
          <p className="mt-1 text-xs text-white/60">Only administrators can create or edit posts. Save a draft, then publish it to make it visible on the website.</p>
        </div>
        <button type="button" onClick={() => updatePosts([createPost(), ...posts])} className="flex items-center gap-2 rounded-xl bg-[#caa34b] px-4 py-2.5 text-xs font-bold text-[#10281e]">
          <Plus className="h-4 w-4" /> Add Blog
        </button>
      </header>

      {posts.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/50">No blog posts yet. Add a post to get started.</div>}

      {posts.map((post, index) => (
        <article key={post.id || index} className="space-y-4 rounded-2xl border border-white/10 bg-[#10281e] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#caa34b]">Post {posts.length - index}</p>
            <button type="button" onClick={() => updatePosts(posts.filter((_, postIndex) => postIndex !== index))} aria-label={`Delete ${post.title || 'blog post'}`} className="rounded-lg p-2 text-red-300 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-white/70">Title
              <input value={post.title || ''} onChange={(e) => updatePost(index, 'title', e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0a1711] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="text-xs text-white/70">Publish date
              <input type="date" value={post.date || ''} onChange={(e) => updatePost(index, 'date', e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0a1711] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="text-xs text-white/70 sm:col-span-2">URL slug
              <input value={post.slug || ''} onChange={(e) => updatePost(index, 'slug', slugify(e.target.value))} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0a1711] px-3 py-2.5 text-sm text-white" />
            </label>
            <div className="text-xs text-white/70 sm:col-span-2">
              <label>Cover image URL<input value={post.image || ''} onChange={(e) => updatePost(index, 'image', e.target.value)} placeholder="Paste an image URL (optional)" className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0a1711] px-3 py-2.5 text-sm text-white placeholder:text-white/30" /></label>
              <button type="button" onClick={() => setImagePickerIndex(index)} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/80 hover:bg-white/10"><ImagePlus className="h-3.5 w-3.5 text-[#caa34b]" />Choose from media library</button>
            </div>
            <label className="text-xs text-white/70 sm:col-span-2">Short introduction
              <textarea rows={2} value={post.excerpt || ''} onChange={(e) => updatePost(index, 'excerpt', e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0a1711] px-3 py-2.5 text-sm text-white" />
            </label>
            <label className="text-xs text-white/70 sm:col-span-2">Blog article
              <textarea rows={10} value={post.content || ''} onChange={(e) => updatePost(index, 'content', e.target.value)} placeholder="Write the article here. Leave a blank line between paragraphs." className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0a1711] px-3 py-2.5 text-sm leading-6 text-white" />
            </label>
          </div>
        </article>
      ))}
      <ImagePickerModal
        isOpen={imagePickerIndex !== null}
        onClose={() => setImagePickerIndex(null)}
        onSelect={(url) => {
          if (imagePickerIndex !== null) updatePost(imagePickerIndex, 'image', url)
          setImagePickerIndex(null)
        }}
      />
    </section>
  )
}
