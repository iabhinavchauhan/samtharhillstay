import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3, Leaf } from 'lucide-react'
import { useContext, useState } from 'react'
import { ResortContext } from '../context/ResortContext.js'
import { resolveImage } from '../utils/resolveImage.js'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function BlogImage({ src, title, className = '', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false)
  const image = failed ? '/images/field-notes/morning-view.jpg' : resolveImage(src, title, 1600, 1000)

  if (!src || failed === 'fallback') return <div className={`grid place-items-center bg-gradient-to-br from-[#173d2c] via-[#31543d] to-[#b9964c] text-center ${className}`}><span className="display-font px-6 text-2xl font-semibold text-[#fffdf5]">Samthar Hillstay</span></div>
  return <img src={image} alt={title || ''} loading={loading} decoding="async" onError={(event) => {
    if (event.currentTarget.dataset.fallback === 'true') setFailed('fallback')
    else {
      event.currentTarget.dataset.fallback = 'true'
      setFailed(true)
    }
  }} className={`object-cover ${className}`} />
}

function readingMinutes(content = '') {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

export default function Blogs() {
  const { siteData } = useContext(ResortContext)
  const { slug } = useParams()
  const posts = [...(siteData?.blogs || [])].filter((post) => post.title && post.content).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))

  if (slug) {
    const post = posts.find((item) => item.slug === slug)
    if (!post) return <main className="mx-auto grid min-h-[60vh] max-w-4xl place-items-center px-6 py-20 text-center"><div><p className="text-sm text-[#777a70]">This story may have moved.</p><Link to="/blogs" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#17442f]"><ArrowLeft className="h-4 w-4" />Back to all stories</Link></div></main>

    const paragraphs = post.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
    return (
      <main className="pb-16">
        <section className="relative isolate flex min-h-[440px] items-end overflow-hidden bg-[#10281e] sm:min-h-[540px]">
          {post.image && <BlogImage src={post.image} title={post.title} loading="eager" className="absolute inset-0 -z-20 h-full w-full" />}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07170f] via-[#07170f]/55 to-[#07170f]/10" />
          <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-20 sm:px-8 sm:pb-14">
            <Link to="/blogs" className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/40"><ArrowLeft className="h-4 w-4" />All stories</Link>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-[#e3c36e]"><Leaf className="h-3.5 w-3.5" />Stories from Samthar</p>
            <h1 className="display-font mt-4 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/75">
              {post.date && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#e3c36e]" />{formatDate(post.date)}</span>}
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#e3c36e]" />{readingMinutes(post.content)} min read</span>
            </div>
          </div>
        </section>

        <article className="mx-auto grid max-w-6xl gap-10 px-5 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-16 lg:pt-14">
          <div className="min-w-0">
            {post.excerpt && <p className="mb-9 border-l-2 border-[#caa34b] pl-5 text-lg font-medium leading-8 text-[#344b3c] sm:text-xl">{post.excerpt}</p>}
            <div className="space-y-6 text-[16px] leading-8 text-[#46534a] sm:text-[17px] sm:leading-[1.95]">
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <div className="mt-12 border-t border-[#e5dfd1] pt-6">
              <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-[#17442f] hover:text-[#9b782d]"><ArrowLeft className="h-4 w-4" />Explore more stories</Link>
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-[#e5dfd1] bg-[#f3f0e6] p-6 lg:sticky lg:top-24">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9b782d]">Stay a little longer</p>
            <h2 className="display-font mt-3 text-xl font-bold leading-snug text-[#173528]">Make the hills part of your story.</h2>
            <p className="mt-3 text-sm leading-6 text-[#657066]">Find a peaceful homestay and take your time discovering Samthar.</p>
            <Link to="/homestays" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#173d2c] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#24533b]">Explore homestays <ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </article>
      </main>
    )
  }

  const featuredPost = posts[0]
  const morePosts = posts.slice(1)

  return (
    <main className="min-h-[65vh] bg-[#faf8f1] pb-20">
      <header className="relative overflow-hidden bg-[#f0ecdf] px-5 py-8 sm:px-8 sm:py-12 lg:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 h-[520px] w-[520px] rounded-full border border-[#caa34b]/20" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-24 h-[360px] w-[360px] rounded-full border border-[#173d2c]/10" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-9 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <div className="py-3 sm:py-8">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-[#9b782d]"><Leaf className="h-4 w-4" />Samthar · Field Journal</p>
            <h1 className="display-font mt-5 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-[#173528] sm:text-6xl">The hills have a way of slowing us down.</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#626a61] sm:text-base">Small stories about mountain mornings, local paths, and the people and places that make Samthar feel like home.</p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a href="#journal" className="inline-flex items-center gap-2 rounded-full bg-[#173d2c] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#24533b]">Browse field notes <ArrowRight className="h-4 w-4" /></a>
              <span className="text-xs font-medium text-[#777a70]">{posts.length ? `${posts.length} ${posts.length === 1 ? 'story' : 'stories'} to explore` : 'A journal in the making'}</span>
            </div>
            <div className="mt-10 flex items-center gap-3 border-t border-[#d9cfb5] pt-5 text-[10px] font-semibold uppercase tracking-[.16em] text-[#73766d]"><span className="h-px w-8 bg-[#caa34b]" />Written slowly, from the hills</div>
          </div>

          {featuredPost ? (
            <Link id="journal" to={`/blogs/${featuredPost.slug}`} className="group relative block overflow-hidden rounded-[26px] border border-[#e2dac8] bg-[#fffdf8] p-2 shadow-[0_18px_50px_rgba(36,49,35,.12)] transition hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden rounded-[19px] bg-[#e8e6dc] sm:h-72 lg:h-[340px]">
                <BlogImage src={featuredPost.image} title={featuredPost.title} className="h-full w-full transition duration-700 group-hover:scale-[1.04]" />
                <span className="absolute left-4 top-4 rounded-full bg-[#fffdf5]/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-[#173d2c] shadow-sm">Latest dispatch</span>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4 px-4 pb-4 pt-5 sm:px-6 sm:pb-5">
                <div className="min-w-0 flex-1">
                  {featuredPost.date && <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#8a887d]"><CalendarDays className="h-3.5 w-3.5 text-[#a17b2f]" />{formatDate(featuredPost.date)}</p>}
                  <h2 className="display-font mt-2 text-xl font-bold leading-snug text-[#173528] sm:text-2xl">{featuredPost.title}</h2>
                  {featuredPost.excerpt && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#687067] sm:text-sm">{featuredPost.excerpt}</p>}
                </div>
                <span aria-label="Open latest story" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e9e3d2] text-[#173d2c] transition group-hover:bg-[#caa34b]"><ArrowUpRight className="h-5 w-5" /></span>
              </div>
            </Link>
          ) : (
            <div id="journal" className="relative overflow-hidden rounded-[26px] border border-[#e2dac8] bg-[#fffdf8] p-2 shadow-[0_18px_50px_rgba(36,49,35,.1)]">
              <div className="relative h-64 overflow-hidden rounded-[19px] sm:h-80 lg:h-[390px]"><img src="/images/field-notes/morning-view.jpg" alt="First light over the hills near Samthar" className="h-full w-full object-cover" /><span className="absolute bottom-4 left-4 rounded-full bg-[#fffdf5]/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-[#173d2c]">A quieter corner of the hills</span></div>
              <div className="px-5 py-4"><p className="text-xs leading-6 text-[#687067]">Our first field notes are on their way. Until then, take in the view and imagine a slower morning in Samthar.</p></div>
            </div>
          )}
        </div>
      </header>

      {morePosts.length > 0 && <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#e5dfd1] pb-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a17b2f]">Keep wandering</p><h2 className="display-font mt-2 text-2xl font-bold text-[#173528] sm:text-3xl">More from the journal</h2></div>
          <span className="text-xs text-[#777a70]">A collection of moments and places</span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {morePosts.map((post, index) => <Link key={post.slug} to={`/blogs/${post.slug}`} className="group overflow-hidden rounded-2xl border border-[#e5dfd1] bg-[#fffdf8] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(36,49,35,.1)]">
            <div className="relative h-52 overflow-hidden bg-[#e8e6dc]"><BlogImage src={post.image} title={post.title} className="h-full w-full transition duration-700 group-hover:scale-[1.05]" /><span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/60 bg-[#fffdf5]/90 text-[10px] font-bold text-[#173d2c]">{String(index + 2).padStart(2, '0')}</span></div>
            <div className="p-5">
              {post.date && <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#85877e]"><CalendarDays className="h-3.5 w-3.5 text-[#a17b2f]" />{formatDate(post.date)}</p>}
              <h3 className="display-font mt-3 text-xl font-bold leading-snug text-[#173528]">{post.title}</h3>
              {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#687067]">{post.excerpt}</p>}
              <span className="mt-5 inline-flex items-center gap-2 border-b border-[#caa34b] pb-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#45604c]">Step inside <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
            </div>
          </Link>)}
        </div>
      </section>}
    </main>
  )
}
