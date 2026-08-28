import { useState } from 'react';
import { Check, BookOpen, Star } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import ScrollReveal from '@/components/ScrollReveal';
import LocationFields, { type LocationData } from '@/components/LocationFields';
import { insertFreeSampleLead } from '@/lib/supabase';

type Tab = 'adult' | 'teen' | 'children';

const content: Record<Tab, {
  label: string; headerBg: string; headerText: string;
  scripture: { ref: string; text: string };
  title: string; paragraphs: string[];
  reflection: string; prayer: string; confession: string;
}> = {
  adult: {
    label: 'Adult Edition', headerBg: 'bg-white/5', headerText: 'text-gold-300',
    scripture: { ref: 'John 1:1', text: '"In the beginning was the Word, and the Word was with God, and the Word was God."' },
    title: 'Before All Things',
    paragraphs: [
      "The opening words of John's Gospel are among the most profound in all of Scripture. Before time began, before creation burst into existence, before the first syllable of human language was ever spoken—the Word already was.",
      "The Greek word John uses is Logos—a term that carried enormous weight in both Jewish and Greek thought. For the Jewish reader, the Word evoked the creative voice of God that called all things into being. For the Greek philosopher, Logos represented the rational principle behind all reality.",
      "John takes both meanings and transcends them: the Word is not a concept or a principle. The Word is a Person. And that Person became flesh and dwelt among us.",
    ],
    reflection: 'What does it mean to you personally that Jesus existed before all things? How does that change the way you approach Him in prayer and devotion today?',
    prayer: 'Lord Jesus, You are the Word made flesh. Before the foundations of the earth were laid, You were. Help me to encounter You today not as a concept but as the living Person You are.',
    confession: 'I declare that Jesus is the Word of God, eternal and unchanging. He was before all things, and through Him all things were made. He is the same yesterday, today, and forever.',
  },
  teen: {
    label: 'Teen Edition', headerBg: 'bg-gold-400/10', headerText: 'text-gold-300',
    scripture: { ref: 'John 1:1', text: '"In the beginning was the Word, and the Word was with God, and the Word was God."' },
    title: 'He Was Already There',
    paragraphs: [
      "Before Netflix. Before social media. Before your school, your city, your country, this planet, the solar system, the galaxy, the universe itself—Jesus was already there.",
      "That's what John is saying in one sentence: 'In the beginning was the Word.' Before anything began, He was already present. Already existing. Already God.",
      "This might feel abstract at first. But here's why it matters for your life right now: the Jesus you're encountering today has always known about you. When you feel like no one really sees you—He does.",
    ],
    reflection: 'Does it feel weird or comforting to think about Jesus knowing about you before you were born? How does it change the way you think about prayer?',
    prayer: "Jesus, it's kind of mind-blowing that You were there before everything. Thank You for being eternal and for knowing me before I even knew myself. Help me to trust that You've always had a plan for my life.",
    confession: 'Jesus existed before everything, and He knows me completely. I am not an accident or an afterthought—I am known and loved by an eternal God.',
  },
  children: {
    label: "Children's Edition", headerBg: 'bg-lavender-400/10', headerText: 'text-lavender-300',
    scripture: { ref: 'John 1:1', text: '"In the beginning was the Word, and the Word was with God, and the Word was God."' },
    title: 'Jesus Was There First!',
    paragraphs: [
      "Do you know what was there before everything? Before the stars and the sun and the moon? Before the animals and the oceans and the mountains?",
      "Jesus was! The Bible says that Jesus is called 'the Word.' That's a special name that means He is how God speaks to us and loves us.",
      "That means Jesus is the most amazing, powerful, and wonderful Person ever. He didn't just appear—He has always been! And the coolest part? This amazing, always-was, always-will-be Jesus loves YOU!",
    ],
    reflection: "If Jesus has always been there—even before the stars were made—what do you think that means about how powerful He is? Draw a picture!",
    prayer: "Dear Jesus, thank You for always being there. Even before the whole world was made, You were already there. I'm so glad You're my friend. Amen!",
    confession: 'Jesus has always been there, and He is always with me. He is bigger than anything I could ever face!',
  },
};

export default function FreeSamplePage() {
  useSEO({
    title: 'Free 7-Day Sample | In Him Daily',
    description: 'Experience In Him Daily for free — read actual pages from all three editions (adult, teen, children) and get a free 7-day sample delivered to your inbox.',
    canonicalPath: '/free-sample',
  });

  const [tab, setTab]           = useState<Tab>('adult');
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail]         = useState('');
  const [firstName, setFirstName] = useState('');
  const [location, setLocation]   = useState<LocationData>({ country: '', city_region: '' });
  const [formError, setFormError] = useState('');

  const c = content[tab];

  return (
    <div className="overflow-x-hidden">
      <section className="relative pt-32 pb-16 bg-navy-700 overflow-hidden" aria-label="Free sample hero">
        <div className="absolute inset-0 bg-cover bg-center" aria-hidden="true" style={{ backgroundImage: "url('https://images.pexels.com/photos/3014852/pexels-photo-3014852.jpeg?auto=compress&cs=tinysrgb&w=1920')", opacity: 0.2 }} />
        <div className="absolute inset-0" aria-hidden="true" style={{ background: 'linear-gradient(180deg, rgba(14,32,53,0.78) 0%, rgba(14,32,53,0.92) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 75%, rgba(201,152,58,0.11) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold-400 text-[0.72rem] font-semibold tracking-[0.16em] uppercase mb-4">Free 7-Day Sample</p>
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Experience In Him Daily<br />
            <span className="text-gold-gradient">For Free</span>
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Read actual pages from all three editions—then get your free 7-day sample delivered to your inbox.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/55">
            {['Adult Edition','Teen Edition',"Children's Edition"].map((e,i)=>(
              <div key={i} className="flex items-center gap-1.5">
                <Check size={13} className="text-gold-400" aria-hidden="true" /> {e}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 ih-section" aria-label="Sample devotional reader">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex justify-center gap-2.5 mb-10">
            {(['adult','teen','children'] as Tab[]).map((t)=>(
              <button key={t} onClick={()=>setTab(t)} role="tab" aria-selected={tab===t}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-250 ${
                  tab===t ? 'ih-btn-gold' : 'ih-btn-ghost'
                }`}>
                {t==='adult' ? 'Adult' : t==='teen' ? 'Teen' : "Children's"}
              </button>
            ))}
          </ScrollReveal>

          <ScrollReveal>
            <div className="rounded-2xl overflow-hidden ih-card">
              <div className={`${c.headerBg} px-8 py-5 flex items-center justify-between`}>
                <div>
                  <p className={`text-[0.68rem] font-bold tracking-[0.15em] uppercase ${c.headerText} opacity-70`}>
                    In Him Daily · {c.label}
                  </p>
                  <p className={`font-playfair text-xl font-bold ${c.headerText} mt-0.5`}>Day 1 · The Word</p>
                </div>
                <BookOpen size={22} className={`${c.headerText} opacity-40`} aria-hidden="true" />
              </div>
              <div className="px-8 py-6 bg-white/[0.03] border-b border-white/10">
                <p className="font-cormorant text-xl italic text-white/90 leading-relaxed">{c.scripture.text}</p>
                <p className="text-gold-300 text-sm font-semibold mt-2">{c.scripture.ref}</p>
              </div>
              <div className="px-8 py-8 bg-white/[0.02]">
                <h2 className="font-playfair text-2xl font-bold text-white mb-5">{c.title}</h2>
                <div className="space-y-3.5 mb-7">
                  {c.paragraphs.map((p,i)=>(
                    <p key={i} className="text-white/65 text-sm leading-relaxed">{p}</p>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/5 border-l-4 border-gold-400">
                    <p className="text-[0.65rem] font-bold text-gold-300 uppercase tracking-[0.12em] mb-1">Reflection</p>
                    <p className="text-sm text-white/80 italic">{c.reflection}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border-l-4 border-navy-400">
                    <p className="text-[0.65rem] font-bold text-navy-300 uppercase tracking-[0.12em] mb-1">Daily Prayer</p>
                    <p className="text-sm text-white/80 italic">{c.prayer}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gold-400/10 border border-gold-400/20">
                    <p className="text-[0.65rem] font-bold text-gold-300 uppercase tracking-[0.12em] mb-1">Daily Confession</p>
                    <p className="text-sm text-white/80 font-medium">{c.confession}</p>
                  </div>
                </div>
              </div>
              <div className="px-8 py-3.5 bg-white/[0.03] border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/45">Day 1 of 120</span>
                <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_,i)=><Star key={i} size={11} className="text-gold-400 fill-gold-400" aria-hidden="true" />)}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 bg-navy-700 relative overflow-hidden" aria-labelledby="sample-cta-heading">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(201,152,58,0.09) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <p className="text-gold-400 text-[0.72rem] font-semibold tracking-[0.16em] uppercase mb-4">Get the Full Sample</p>
            <h2 id="sample-cta-heading" className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Your Free 7-Day Journey Awaits
            </h2>
            <p className="text-white/55 mb-10 text-lg">
              Receive 7 complete days—all three editions—delivered to your inbox. Free, no strings attached.
            </p>
            {submitted ? (
              <div className="p-8 rounded-2xl bg-gold-400/15 border border-gold-400/25 animate-fade-in">
                <div className="w-11 h-11 rounded-full bg-gold-400/25 flex items-center justify-center mx-auto mb-4">
                  <Check size={22} className="text-gold-300" aria-hidden="true" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-white mb-2">It's On Its Way!</h3>
                <p className="text-white/55">Thank you! Your free 7-Day Sample is on its way. We pray these devotionals help you encounter Jesus every day.</p>
              </div>
            ) : (
              <form onSubmit={async (e)=>{ e.preventDefault(); if(!email||!firstName||!location.country) { setFormError('Please fill in your name, email, and country.'); return; } try { setFormError(''); await insertFreeSampleLead({first_name:firstName,email,source:'free_sample_page',country:location.country,city_region:location.city_region}); setSubmitted(true); } catch (err) { setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); } }} className="space-y-3.5" noValidate>
                <input type="text" placeholder="Full Name *" value={firstName} onChange={e=>setFirstName(e.target.value)} required aria-label="Full name"
                  className="w-full px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/35 focus:outline-none focus:border-gold-400 transition-colors text-sm" />
                <input type="email" placeholder="Email Address *" value={email} onChange={e=>setEmail(e.target.value)} required aria-label="Email address"
                  className="w-full px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/35 focus:outline-none focus:border-gold-400 transition-colors text-sm" />
                <LocationFields value={location} onChange={setLocation} />
                <button type="submit" className="w-full py-4 ih-btn-gold text-[0.9rem]">
                  Send Me The Free Sample
                </button>
                {formError && <p className="text-red-300 text-xs text-center">{formError}</p>}
                <p className="text-white/30 text-xs">No spam. Just scripture. Unsubscribe anytime.</p>
              </form>
            )}
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 ih-section text-center" aria-label="Closing scripture">
        <div className="max-w-2xl mx-auto px-4">
          <ScrollReveal>
            <div className="gold-divider mx-auto mb-8" aria-hidden="true" />
            <p className="font-cormorant text-3xl text-white italic leading-relaxed">
              &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
            </p>
            <p className="text-gold-400 text-[0.72rem] font-semibold mt-3 tracking-[0.18em] uppercase">Psalm 119:105</p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
