import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const load = (relativePath) =>
  JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));

export function makeRule70Proposals(sources, dataset) {
  if (!sources || !Array.isArray(sources.categories) || sources.categories.length !== 18) {
    throw new Error('18 verified source categories required');
  }
  if (!dataset || !Array.isArray(dataset.items) || dataset.live_voting_allowed !== false) {
    throw new Error('Historical draft data only');
  }
  const categoryMap = new Map(sources.categories.map(x => [x.source_category_id, x]));
  const seenIds = new Set();
  const seenSourceUnits = new Set();
  const options = dataset.items.map(item => {
    const category = categoryMap.get(item.category_id);
    if (!category) throw new Error('Unknown source category: ' + item.category_id);
    if (item.review_status !== 'PENDING_MANUAL_REVIEW' ||
        item.eligible_for_live_vote !== false ||
        item.canonical_activity_id !== null) {
      throw new Error('Never auto-approve or canonical-map historical source candidates');
    }
    if (item.source_document_url !== category.document_url) {
      throw new Error('Source PDF URL mismatch: ' + item.candidate_id);
    }
    if (!/^s70-[a-z]+-\d{3}-(p1-p3|p4-p6|m1-m3|p1-p6|preschool)$/.test(item.candidate_id)) {
      throw new Error('Invalid namespaced source ID');
    }
    if (typeof item.name !== 'string' || !item.name.trim() ||
        typeof item.level_code !== 'string' || !item.level_code ||
        !Number.isInteger(item.source_pdf_page) || item.source_pdf_page <= 0) {
      throw new Error('Incomplete name, level, or PDF provenance');
    }
    const id = 'rule70:' + item.candidate_id;
    if (seenIds.has(id)) throw new Error('Duplicate historical option ID: ' + id);
    seenIds.add(id);
    const unit = JSON.stringify([item.category_id,item.name,item.level_code]);
    if (seenSourceUnits.has(unit)) throw new Error('Duplicate item and level within rule 70 source');
    seenSourceUnits.add(unit);
    return {
      option_id: id,
      origin: 'sillapa70',
      source_competition_no: 70,
      source_academic_year_be: 2565,
      label: item.name,
      category_id: item.category_id,
      level_code: item.level_code,
      source_pdf_url: item.source_document_url,
      source_pdf_page: item.source_pdf_page,
      review_status: 'DRAFT_REVIEW_REQUIRED',
      round_selection_status: 'NOT_SELECTED',
      is_live_ballot_item: false
    };
  });
  const populated = new Set(options.map(x => x.category_id));
  return {
    schema_version: '1.0', dataset_id: 'rule70-options-v2b',
    source_index_url: sources.index_url,
    source_edition: 'Sillapa 70 (academic year 2565)',
    scope: 'historical-options-only',
    is_complete_extraction: false,
    is_official_74_rules: false,
    is_live_voting_enabled: false,
    count: options.length,
    omitted_categories: sources.categories
      .filter(x => !populated.has(x.source_category_id))
      .map(x => x.source_category_id),
    notes: [
      'No canonical #73/74 mapping required',
      'All items must be checked for spelling, level, eligibility and duplication before admin selects into a round',
      'A source option can coexist with an activity in another catalog; admin explicitly decides round inclusion',
      '37 additional family examples remain review-only and are not vote option proposals'
    ],
    options
  };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const sources = load('../catalog/rule70/source_documents.json');
  const dataset = load('../catalog/rule70/candidate_items.json');
  process.stdout.write(JSON.stringify(makeRule70Proposals(sources, dataset), null, 2) + '\n');
}
