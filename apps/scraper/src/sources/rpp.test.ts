import { describe, expect, it } from "vitest";

import { extractExcerpt, parseRppListing } from "./rpp";

const LISTING = `
<article class="news news--summary-standard">
  <figure class="news__media"><a href="https://rpp.pe/x" class="news__image"><img src="x.jpg" alt=""></a></figure>
  <div class="news__data">
    <h3 class="news__tag"><a href="https://rpp.pe/peru/lima">Lima</a></h3>
    <h2 class="news__title">
      <a href="https://rpp.pe/peru/lima/huaico-bloquea-la-carretera-central-en-el-km-45-noticia-1712903">
        Huaico bloquea la Carretera Central en el km 45 &amp; deja buses varados
      </a>
    </h2>
    <div class="news__info">
      <span class="news__author">por&nbsp;<a href="https://rpp.pe/autor/redaccion">Redacción RPP</a></span>
      <time class="news__date x-ago" data-x="2026-10-17T13:40:05-05:00">13:40 hs</time>
    </div>
  </div>
</article>
<article class="news">
  <div class="news__data">
    <h2 class="news__title"><a href="https://rpp.pe/sin-id">Sin identificador</a></h2>
  </div>
</article>`;

describe("parseRppListing", () => {
	it("reads title, url, section, author and published time from each card", () => {
		const [first, second] = parseRppListing(LISTING);
		expect(first).toEqual({
			sourceId: "1712903",
			url: "https://rpp.pe/peru/lima/huaico-bloquea-la-carretera-central-en-el-km-45-noticia-1712903",
			title:
				"Huaico bloquea la Carretera Central en el km 45 & deja buses varados",
			section: "Lima",
			author: "Redacción RPP",
			publishedAt: new Date("2026-10-17T18:40:05.000Z"),
		});
		expect(second).toEqual({
			sourceId: "https://rpp.pe/sin-id",
			url: "https://rpp.pe/sin-id",
			title: "Sin identificador",
			section: null,
			author: null,
			publishedAt: null,
		});
	});
});

describe("extractExcerpt", () => {
	it("decodes the meta description", () => {
		expect(
			extractExcerpt(
				'<head><meta name="description" content="Tr&aacute;nsito restringido en la v&iacute;a." /></head>',
			),
		).toBe("Tránsito restringido en la vía.");
	});

	it("returns null without a description", () => {
		expect(extractExcerpt("<head></head>")).toBeNull();
	});
});
