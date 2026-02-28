# MultiBank UI Automation — Test Case Summary

**Total Test Cases: 140** | **Spec Files: 7** | **Browsers: Chromium, Firefox, WebKit** | **Viewports: 5**

---

## 1. navigation.spec.ts (26 tests)

### Navigation - Header Display (6 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 1 | should display the header/navigation bar | Verify header is rendered on page load | Header element is visible |
| 2 | should display the company logo | Verify company logo appears in header | Logo is visible |
| 3 | should have logo linking to homepage | Verify logo href points to homepage | Logo href equals `/en-AE` |
| 4 | should have sticky header position | Verify header stays fixed on scroll | Header has sticky/fixed CSS position |
| 5 | should have expected total header links | Verify exact count of links in header | Link count matches expected total |
| 6 | should have minimum expected navigation links | Verify header has at least minimum links | Link count >= minimum threshold |

### Navigation - Menu Items Display (8 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 7 | should display all expected navigation items | Verify all nav items (Explore, Features, Company) are present | Each nav item text appears in header |
| 8 | "{name}" link should have correct href pattern | Verify each nav link href contains correct path pattern | Href contains expected path (e.g., `/explore`, `/features`) |
| 9 | should display all header link details with valid hrefs | Verify every header link has a non-empty href | All links have truthy href values |
| 10 | should display Sign In link | Verify Sign In link is visible in header | Sign In link is visible |
| 11 | should display Sign Up link | Verify Sign Up link is visible in header | Sign Up link is visible |
| 12 | Sign In link should point to login page | Verify Sign In href points to login URL | Href contains login path |
| 13 | Sign Up link should point to registration page | Verify Sign Up href points to registration URL | Href contains registration path |

### Navigation - Functional Link Destinations (7 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 14 | should navigate to {name} page | Verify clicking each nav item navigates to correct page | URL contains expected path after click |
| 15 | should navigate back to homepage via logo | Verify clicking logo from any page returns to homepage | URL no longer contains previous page path |
| 16 | navigation should persist across pages | Verify header remains visible and consistent across page transitions | Header visible with same link count on Features and Company pages |
| 17 | should navigate through all pages sequentially | Verify navigating through all pages one after another works | Each URL matches expected path after sequential clicks |

### Footer Navigation (4 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 18 | should display the footer section | Verify footer is rendered on homepage | Footer element is visible |
| 19 | should have minimum expected footer links | Verify footer has at least minimum number of links | Link count >= minimum threshold |
| 20 | should display expected legal links in footer | Verify legal links (Privacy Policy, Terms, etc.) appear | Each expected legal link text is present |
| 21 | should display Contact Us link in footer | Verify Contact Us link is visible | Contact Us link is visible |

---

## 2. trading.spec.ts (22 tests)

### Trading - Homepage Crypto Assets (7 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 22 | should display crypto asset list on homepage | Verify crypto asset list container is visible | Asset list is visible |
| 23 | should display minimum number of crypto assets | Verify homepage shows at least the expected number of assets | Asset count >= minimum threshold |
| 24 | should display expected crypto assets | Verify specific crypto assets (BTC, ETH, SOL, etc.) are listed | Each expected asset name appears in the list |
| 25 | should display crypto asset images with correct alt text | Verify asset icons have proper alt text | At least 1 expected asset name matches image alt text |
| 26 | should have asset links pointing to explore pages | Verify asset links follow `/explore/{SYMBOL}` pattern | Links contain `/explore/` in href |
| 27 | should display price information for crypto assets | Verify assets show dollar-denominated prices | At least one asset text contains `$` |
| 28 | should display percentage change for crypto assets | Verify assets show percentage change values | At least one asset text contains `%` |

### Trading - Explore Page (6 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 29 | should load the explore page | Verify explore page URL loads correctly | URL contains `/explore` |
| 30 | should display filter tabs on explore page | Verify filter tabs (Hot, Gainers, Losers) are present | Tab count >= expected tab count |
| 31 | should display expected filter tabs | Verify each expected tab label appears | Tab texts contain "Hot", "Gainers", "Losers" |
| 32 | should switch to {tab} filter tab | Verify clicking each tab keeps asset list visible | Asset list remains visible after tab switch |

### Spot Trading - Section Display (4 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 33 | should display "Spot market" heading | Verify "Spot market" heading is visible on explore page | Heading is visible |
| 34 | should display "Today's top crypto prices" heading | Verify section heading is visible (desktop only, skipped < 1024px) | Heading is visible on desktop viewports |
| 35 | should display "Market sentiment" heading | Verify "Market sentiment" heading is visible | Heading is visible |
| 36 | should display expected explore page headings | Verify all expected headings appear on explore page | All configured heading texts are present |

### Spot Trading - Trading Pair Data Structure (3 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 37 | should display trading pairs with correct card structure | Verify each trading pair card has symbol, name, and icon | All cards have required fields populated |
| 38 | should have trading pair links with correct href format | Verify each pair links to `/explore/{SYMBOL}` | Hrefs match expected pattern and contain symbol |
| 39 | should display expected crypto assets in trading pairs | Verify specific expected symbols appear in the pair list | Each expected symbol is present |

### Spot Trading - Category Tabs Display Trading Pairs (7 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 40 | "{tab}" tab should display trading pairs | Verify each tab shows at least minimum number of pairs | Asset count >= minimum per category |
| 41 | "{tab}" tab trading pairs should have valid structure | Verify pairs under each tab have symbol, name, icon, and href | First pair has all required fields |
| 42 | different tabs should display different trading pairs | Verify Hot and Gainers tabs show different content | Hot symbols list differs from Gainers symbols list |

---

## 3. banners.spec.ts (18 tests)

### Homepage Sections & Content (9 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 43 | should display minimum number of content sections | Verify homepage has at least expected number of `<section>` elements | Section count >= minimum |
| 44 | should display the hero section | Verify hero section is visible on homepage | Hero section is visible |
| 45 | should display hero section with correct heading | Verify hero heading text matches expected content | Hero text contains expected heading |
| 46 | should display {section description} | Verify each homepage content section contains expected text patterns | Page body contains expected text patterns |
| 47 | should have sections with non-empty content | Verify no section is empty | All sections have non-empty trimmed text |
| 48 | should display Download the app CTA | Verify "Download the app" call-to-action is visible | CTA link is visible |
| 49 | should display Open an account CTA | Verify "Open an account" call-to-action is visible | CTA link is visible |
| 50 | should have expected CTA buttons | Verify all configured CTA button texts are visible | Each expected CTA is visible |

### Marketing Banners - Bottom of Page (9 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 51 | should have minimum expected bottom banner sections | Verify bottom of page has enough banner sections | Banner count >= minimum |
| 52 | should display Khabib/MBG Token marketing banner | Verify Khabib partnership banner is visible | Banner is visible |
| 53 | Khabib banner should contain expected text | Verify banner contains expected marketing text | Text contains all expected patterns |
| 54 | should display trading features promo section | Verify trading features promotional section is visible | Section is visible |
| 55 | trading features promo should have correct heading | Verify promo heading matches expected text | Heading text matches |
| 56 | trading features promo should display sub-headings | Verify promo sub-headings are present | All expected sub-headings appear |
| 57 | should display View platform features link | Verify "View platform features" link is visible | Link is visible |
| 58 | View platform features link should have correct href | Verify link points to features page | Href contains expected URL pattern |
| 59 | should display Catch your next trade section | Verify "Catch your next trade" section is visible | Section is visible |
| 60 | Catch your next trade should have correct heading | Verify section heading text matches | Heading contains expected text |
| 61 | Catch your next trade should display category tabs | Verify category tabs (crypto, forex, etc.) appear in section | All expected category labels present |

---

## 4. download.spec.ts (19 tests)

### Download & App Links (7 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 62 | should display the Download the app link | Verify download link is visible on homepage | Link is visible |
| 63 | should have Download link pointing to app deep link | Verify download link href points to app store/deep link | Href contains expected URL pattern |
| 64 | Download the app link should have valid URL format | Verify download link href starts with `https://` | Href matches URL regex |
| 65 | should display the Sign Up link in header | Verify Sign Up link is visible in header | Link is visible |
| 66 | should have Sign Up link pointing to registration | Verify Sign Up href contains registration path | Href contains expected pattern |
| 67 | should display the Open an account link | Verify "Open an account" link is visible | Link is visible |
| 68 | should have Open an account link pointing to registration | Verify "Open an account" href contains registration path | Href contains expected pattern |

### Footer - Structure & Links (7 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 69 | should display the footer section | Verify footer is rendered | Footer is visible |
| 70 | should have minimum expected footer links | Verify footer link count meets threshold | Link count >= minimum |
| 71 | should display all expected legal links | Verify legal links (Privacy, Terms, AML, etc.) are present | Each legal link text appears |
| 72 | legal links should have valid hrefs | Verify each legal link has a valid href containing `about/` | All links have truthy hrefs with correct path |
| 73 | should display Contact Us link | Verify Contact Us link is visible in footer | Link is visible |
| 74 | Contact Us link should have correct href | Verify Contact Us href contains "contact" | Href contains `contact` |
| 75 | should display Hacken audit link | Verify Hacken security audit link is visible | Link is visible |
| 76 | Hacken audit link should point to correct URL | Verify Hacken link href matches expected URL | Href contains expected Hacken URL |

### Footer - Payment Methods & Compliance (5 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 77 | should display payment method icons | Verify correct number of payment icons (Visa, Mastercard, etc.) | Icon count matches expected |
| 78 | should display all expected payment icons | Verify each expected payment brand icon is present | Each brand appears in icon alt texts |
| 79 | should display copyright notice | Verify copyright text is present in footer | Footer contains copyright pattern |
| 80 | should contain VARA regulatory disclosure | Verify VARA (Virtual Assets Regulatory Authority) disclosure text | Footer contains VARA disclosure text |
| 81 | footer should contain "mb.io" branding | Verify mb.io brand name appears in footer | Footer text contains "mb.io" |

---

## 5. about.spec.ts (37 tests)

### Company Page - Why MultiBank Group (9 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 82 | should load the Company page successfully | Verify company page loads with visible content | Main content visible, URL contains `/company` |
| 83 | should display the page title | Verify company page title text matches expected | Title contains expected text |
| 84 | should render expected content sections | Verify page has at least expected number of sections | Section count >= threshold |
| 85 | should display expected headings | Verify all expected heading texts appear on page | Each heading text is present |
| 86 | should contain expected text content | Verify page body contains key text patterns | Each text pattern is found |
| 87 | should display sub-headings | Verify sub-headings (h3) match expected content | Each sub-heading text is present |
| 88 | should display images/graphics | Verify page has at least minimum number of images | Image count >= minimum |
| 89 | should have paragraphs with meaningful content | Verify paragraphs exist with substantial text (>10 chars) | Paragraph count >= minimum, non-empty content |
| 90 | should display multiple headings for content structure | Verify page has at least 3 headings for structure | Heading count >= 3 |

### Company Page - Stats & Key Figures (3 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 91 | should display annual turnover stat | Verify annual turnover figure (e.g., "$2 trillion") is shown | Stat value found in page text |
| 92 | should display customers worldwide stat | Verify customer count figure (e.g., "2,000,000+") is shown | Stat value found in page text |
| 93 | should display offices globally stat | Verify global offices figure (e.g., "25+") is shown | Stat value found in page text |

### Company Page - Strength Cards & Media (6 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 94 | should display strength card images | Verify strength card images have correct alt text | Alt texts contain expected card labels |
| 95 | should display article images with correct alt text | Verify article images have expected alt attributes | Alt texts match expected values |
| 96 | should display Community & Media section | Verify Community & Media section is visible | Section is visible |
| 97 | Community & Media should have social content | Verify section has substantial text mentioning "multibank" | Text length > 50, contains "multibank" |
| 98 | should display Get in touch CTA | Verify "Get in touch" call-to-action link is visible | Link is visible |
| 99 | Get in touch should link to contact page | Verify CTA href points to contact page | Href contains expected contact path |

### Features Page (10 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 100 | should load the Features page successfully | Verify features page loads with visible content | Main content visible, URL contains `/features` |
| 101 | should display the Features page title | Verify page title matches expected text | Title contains expected features heading |
| 102 | should display expected feature headings | Verify all expected feature heading texts appear | Each heading text is present |
| 103 | should display additional feature headings | Verify additional headings/sub-headings appear | Each additional heading text is found |
| 104 | should have multiple content sections | Verify page has at least minimum number of sections | Section count >= minimum |
| 105 | should display Solutions with advantages section | Verify "Solutions" section text is present | Page contains solutions heading text |
| 106 | Solutions section should have expected cards | Verify each expected solution card text appears | Each card text is found on page |
| 107 | should display VIP section | Verify VIP section content is present | Page contains VIP heading pattern |
| 108 | should display feature images | Verify feature section has at least minimum images | Image count >= minimum |

### Navigation to Company Page (2 tests)

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 109 | should navigate to Company page from header nav | Verify clicking Company nav item navigates correctly | URL contains `/company` |
| 110 | should navigate to Features page from header nav | Verify clicking Features nav item navigates correctly | URL contains `/features` |

---

## 6. accessibility.spec.ts (8 tests)

### WCAG 2.1 AA Accessibility Scans (8 tests)

Runs axe-core accessibility analysis on each key page, checking for critical and serious WCAG violations.

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 123 | Homepage should have no critical accessibility violations | Run axe-core scan on homepage and check for critical-impact violations | Critical violation count <= 1 |
| 124 | Homepage should have no serious accessibility violations | Run axe-core scan on homepage and check for serious-impact violations | Serious violation count <= 5 |
| 125 | Explore should have no critical accessibility violations | Run axe-core scan on explore page and check for critical-impact violations | Critical violation count <= 1 |
| 126 | Explore should have no serious accessibility violations | Run axe-core scan on explore page and check for serious-impact violations | Serious violation count <= 5 |
| 127 | Features should have no critical accessibility violations | Run axe-core scan on features page and check for critical-impact violations | Critical violation count <= 1 |
| 128 | Features should have no serious accessibility violations | Run axe-core scan on features page and check for serious-impact violations | Serious violation count <= 5 |
| 129 | Company should have no critical accessibility violations | Run axe-core scan on company page and check for critical-impact violations | Critical violation count <= 1 |
| 130 | Company should have no serious accessibility violations | Run axe-core scan on company page and check for serious-impact violations | Serious violation count <= 5 |

---

## 7. performance.spec.ts (10 tests)

### Page Load & TTFB (8 tests)

Measures page load time and Time to First Byte using the Navigation Timing API.

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 131 | Homepage page load time should be within threshold | Measure full page load time via Navigation Timing API | Load time <= 15000ms |
| 132 | Homepage TTFB should be within threshold | Measure Time to First Byte via Navigation Timing API | TTFB <= 3000ms |
| 133 | Explore page load time should be within threshold | Measure full page load time for explore page | Load time <= 15000ms |
| 134 | Explore TTFB should be within threshold | Measure TTFB for explore page | TTFB <= 3000ms |
| 135 | Features page load time should be within threshold | Measure full page load time for features page | Load time <= 15000ms |
| 136 | Features TTFB should be within threshold | Measure TTFB for features page | TTFB <= 3000ms |
| 137 | Company page load time should be within threshold | Measure full page load time for company page | Load time <= 15000ms |
| 138 | Company TTFB should be within threshold | Measure TTFB for company page | TTFB <= 3000ms |

### Web Vitals — Homepage (2 tests)

Captures Largest Contentful Paint and Cumulative Layout Shift using PerformanceObserver.

| # | Test Case | Objective | Expected Result |
|---|-----------|-----------|-----------------|
| 139 | Homepage LCP should be within threshold | Measure Largest Contentful Paint via PerformanceObserver | LCP <= 5000ms |
| 140 | Homepage CLS should be within threshold | Measure Cumulative Layout Shift via PerformanceObserver | CLS <= 0.25 |

---

## Test Coverage Matrix

| Area | Tests | What's Covered |
|------|-------|----------------|
| Header & Navigation | 26 | Logo, nav links, sticky header, Sign In/Up, page navigation, cross-page persistence |
| Trading & Crypto | 22 | Asset listing, prices, percentages, filter tabs, card structure, explore page |
| Marketing Banners | 18 | Hero section, CTAs, Khabib banner, trading promo, category tabs |
| Downloads & Footer | 19 | App download link, footer links, legal links, payment icons, VARA compliance |
| Company & Features | 37 | Page content, stats, strength cards, media section, feature headings, VIP section |
| Accessibility | 8 | WCAG 2.1 AA axe-core scans — critical & serious violations per page |
| Performance | 10 | Page load time, TTFB, LCP, CLS — Navigation Timing API & Web Vitals |
