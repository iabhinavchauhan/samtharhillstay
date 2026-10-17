import { useState } from 'react'

const faqs = [
  { question: 'How can I find destinations?', answer: 'Use the Explore and Destinations pages to browse curated options by category, region, and travel style.' },
  { question: 'How does wishlist work?', answer: 'Tap the Wishlist button on any card and your saved items will appear on the Wishlist page.' },
  { question: 'How does comparison work?', answer: 'Use the Compare button on cards to shortlist destinations, hotels, or experiences for side-by-side comparison.' },
  { question: 'How can I find hotels near a destination?', answer: 'Visit the Hotels page and browse stays aligned to popular destinations and adventure locations.' },
  { question: 'How can I discover food near my trip?', answer: 'Head to the Food page to browse place-based local cuisine and dining picks.' },
]

export default function Help() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="page-shell">
      <div className="section-block">
        <div className="section-heading">
          <p className="section-label">Help</p>
          <h3>Support for your journey planning</h3>
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <div key={item.question} className="faq-item">
              <button className="faq-question" onClick={() => setOpenIndex(index === openIndex ? -1 : index)}>
                {item.question}
              </button>
              {openIndex === index && <p className="faq-answer">{item.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
