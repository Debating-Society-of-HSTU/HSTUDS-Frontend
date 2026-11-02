'use client';

import React, { useEffect, useState } from 'react';
import { getLatestBlogs, getUpcomingEvents } from '@/lib/db';
import { PartnersSection } from '@/components/partners-section';
import { Hero } from '@/components/home/hero';
import { KeywordMarquee, Manifesto, Stats, Pillars, StoriesAndEvents, ClosingCta } from '@/components/home/sections';

export default function Home() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const b = await getLatestBlogs(3);
      const e = await getUpcomingEvents(3);
      setBlogs(b);
      setUpcomingEvents(e);
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col pb-12">
      <Hero />
      <KeywordMarquee />
      <Manifesto />
      <div className="flex flex-col gap-28 sm:gap-36 pt-24 sm:pt-32">
        <Stats />
        <Pillars />
        <StoriesAndEvents blogs={blogs} events={upcomingEvents} />
        <PartnersSection />
        <ClosingCta />
      </div>
    </div>
  );
}
