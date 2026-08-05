import type { Article, ArticleCategory } from '@/types';
import { seeded, slugify } from '@/lib/utils';
import { imageCount, unsplash } from './images';
import { agents } from './agents';

const seeds: [string, ArticleCategory, string][] = [
  ['What a measured floor plan tells you that photos cannot', 'buying', 'Wide-angle lenses add rooms that are not there. A dimensioned plan does not.'],
  ['The five-year rule, tested against 4,200 closings', 'investment', 'We ran our own transaction history to see when buying beats renting.'],
  ['Reading a roof from the street', 'buying', 'Six things a surveyor checks before the ladder ever comes out.'],
  ['Austin inventory report: winter', 'market', 'Listing volume, days on market and where the negotiating room actually is.'],
  ['Why we publish utility readings on every listing', 'market', 'An energy bill is a more honest description of a house than a brochure.'],
  ['Ceiling height is the cheapest luxury', 'design', 'Thirty centimetres changes a room more than any finish you can buy.'],
  ['How to compare two homes that are not comparable', 'buying', 'A framework for weighing land against layout against location.'],
  ['Rental yield without the arithmetic sleight of hand', 'investment', 'Gross yield flatters everything. Here is the number that survives a vacancy.'],
  ['The offer letter that actually gets accepted', 'buying', 'Terms sellers care about, ranked by how often they decide the deal.'],
  ['Miami waterfront: what the flood maps changed', 'market', 'Insurance is now a pricing input, not a closing formality.'],
  ['Renovating a 1970s kitchen without moving a wall', 'design', 'Where the money goes when the plan already works.'],
  ['Understanding the survey pack, page by page', 'buying', 'A walkthrough of the document we attach to every listing.'],
  ['Seattle craftsman stock is shrinking. What replaces it?', 'market', 'Lot splits, infill and what buyers lose in the trade.'],
  ['Fixed, variable, or the third option nobody offers you', 'investment', 'Rate structures explained with the actual monthly numbers.'],
  ['Light is a floor plan decision', 'design', 'Orientation, glazing ratio and the rooms you will actually use.'],
  ['Buying from abroad: the twelve-step version', 'buying', 'Notary, lender, tax ID and the two steps people always leave too late.'],
  ['Denver: the yield map has moved north', 'market', 'Where rents grew faster than prices over the last four quarters.'],
  ['New build snagging list you can print', 'buying', 'Sixty checks to run before you sign off on a handover.'],
  ['What a townhouse costs to hold', 'investment', 'HOA, tax, maintenance and the reserve nobody budgets for.'],
  ['Storage is architecture, not furniture', 'design', 'Built-in volume changes how large a home feels.'],
  ['Charleston single houses: restoring the piazza', 'design', 'Historic detailing that survives a modern retrofit.'],
  ['The quiet cost of a long commute', 'living', 'Twenty minutes each way, priced over a ten-year hold.'],
  ['How we price a home in a thin market', 'market', 'When there are three comparables, method matters more than instinct.'],
  ['Solar makes sense on this roof, not that one', 'investment', 'Pitch, orientation, shading and the payback window.'],
  ['Moving with children mid-year', 'living', 'School timing, storage and the week that always goes wrong.'],
  ['Penthouse terraces: the maintenance nobody mentions', 'design', 'Drainage, wind load and the planting that survives both.'],
  ['Portland garden lots, measured', 'market', 'Setbacks, tree code and what you can actually build.'],
  ['Your deposit is not your only cash requirement', 'buying', 'The eight line items that land between offer and keys.'],
  ['Living small on purpose', 'living', 'Lofts under 900 sq ft that work, and the rules they share.'],
  ['Scottsdale shade planning', 'design', 'Overhangs, courtyards and cooling load in a desert climate.'],
];

function body(title: string, excerpt: string, category: ArticleCategory) {
  return [
    `## The short version`,
    excerpt,
    `## Why it matters`,
    `Most ${category} decisions get made on a Sunday afternoon with two browser tabs open and no way to check the claims in either of them. That is not a knowledge problem, it is a documentation problem. When the underlying record is public — dimensions, readings, dates, costs — the decision gets simpler and the argument gets shorter.`,
    `## What we did`,
    `Our field team pulled the relevant surveys from the last four quarters, stripped out anything that was not measured on site, and compared the remainder against the listing copy that was published at the time. The gap between the two is where this article lives.`,
    `## What to do with it`,
    `Take the checklist below to your next viewing. Ask for the numbers before you ask for the price. If an agent cannot produce a measured plan and a utility reading for a home they are marketing, that absence is itself information.`,
    `## The checklist`,
    `1. Measured plan for every level, with dimensions on the walls.\n2. Twelve months of utility readings, not an estimate.\n3. Dates and invoices for any structural or services work.\n4. A written note of what the seller knows and has not fixed.\n5. Comparable closings, not comparable asking prices.`,
    `We publish all five on every Vestra listing. Ask us to explain any line on the record — that is the job.`,
  ].join('\n\n');
}

export const articles: Article[] = seeds.map(([title, category, excerpt], index) => {
  const rng = seeded(4400 + index * 17);
  const publishedAt = new Date(Date.UTC(2025, 11 - (index % 12), 2 + (index % 26))).toISOString();

  return {
    id: `art-${index + 1}`,
    slug: slugify(title),
    title,
    excerpt,
    content: body(title, excerpt, category),
    cover: unsplash((index * 7 + 3) % imageCount, 1200, 760),
    category,
    tags: [category, 'vestra', index % 2 === 0 ? 'field notes' : 'data'],
    authorId: agents[index % agents.length].id,
    publishedAt,
    readingMinutes: 4 + Math.floor(rng() * 6),
  };
});

export const articleBySlug = (slug: string) => articles.find((item) => item.slug === slug);

export const articleCategories: { value: ArticleCategory; label: string }[] = [
  { value: 'market', label: 'Market reports' },
  { value: 'buying', label: 'Buying guides' },
  { value: 'investment', label: 'Investment' },
  { value: 'design', label: 'Design' },
  { value: 'living', label: 'Living' },
];
