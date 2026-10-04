import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const tips = [
  { text: "Don't wait until the week before finals to find good resources — ask people in your program in week one where they actually go.", source: "3rd-year Business student" },
  { text: "The TMU library subject guides are underrated. A librarian already organized the good sources for your exact course.", source: "4th-year Engineering student" },
  { text: "Join your course's Discord early. Most of the useful stuff — past exams, study groups — gets shared there, not on the official course page.", source: "2nd-year Computer Science student" },
  { text: "Use office hours even if you don't have a specific question. Professors remember students who show up.", source: "1st-year student" }
];

function App() {
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadDirectory() {
      try {
        const [categoryResponse, resourceResponse] = await Promise.all([
          fetch(`${API_URL}/categories`, { signal: controller.signal }),
          fetch(`${API_URL}/resources`, { signal: controller.signal })
        ]);
        if (!categoryResponse.ok || !resourceResponse.ok) {
          const failedResponse = !categoryResponse.ok ? categoryResponse : resourceResponse;
          const message = await failedResponse.json();
          throw new Error(message.error ?? "The directory API returned an error.");
        }
        const [categoryData, resourceData] = await Promise.all([
          categoryResponse.json(),
          resourceResponse.json()
        ]);
        setCategories(categoryData);
        setResources(resourceData);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(`${loadError.message} The Express API must also be running.`);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadDirectory();
    return () => controller.abort();
  }, []);

  const groupedResources = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return categories.map((category) => ({
      ...category,
      resources: resources.filter((resource) => {
        const matchesCategory = resource.category?._id === category._id;
        const matchesSearch = !term || `${resource.name} ${resource.description} ${resource.tag}`.toLowerCase().includes(term);
        return matchesCategory && matchesSearch;
      })
    }));
  }, [categories, resources, searchTerm]);

  const visibleResourceCount = groupedResources.reduce((count, category) => count + category.resources.length, 0);
  const applySearch = () => setSearchTerm(searchInput.trim());
  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header>
        <div className="header-inner">
          <a className="logo" href="#" aria-label="Study Hub home">Study<span>Hub</span></a>
          <nav className={`primary-nav${navOpen ? " open" : ""}`} aria-label="Primary navigation">
            {categories.map((category) => <a key={category._id} href={`#${category.slug}`} onClick={() => setNavOpen(false)}>{category.name.replace(" Resources", "").replace(" & CS", "")}</a>)}
            <a href="#student-life" onClick={() => setNavOpen(false)}>Student Life</a>
            <a href="#tmu-links" onClick={() => setNavOpen(false)}>TMU Links</a>
          </nav>
          <button className="nav-toggle" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>Menu</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <h1>Stop hunting for resources. Start finding them.</h1>
          <p className="lede">Every course link, study guide, and tip that TMU students already rely on — Google, Reddit threads, old Discords, someone's shared Drive folder — collected in one place.</p>
          <form className="search-wrap" onSubmit={(event) => { event.preventDefault(); applySearch(); }}>
            <div className="search-box">
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={'Search for a resource, e.g. "LeetCode" or "citations"'} aria-label="Search resources" />
              <button type="submit">Search</button>
            </div>
          </form>
          <div className="hero-meta">
            <div><strong>{loading ? "—" : `${resources.length}+`}</strong>resources listed</div>
            <div><strong>{categories.length || "—"}</strong>categories</div>
            <div><strong>Growing</strong>weekly, from student submissions</div>
          </div>
        </div>
      </section>

      {searchTerm && <div className="search-status" role="status">Showing results for “{searchTerm}” <button onClick={clearSearch}>Clear search</button></div>}
      <div className="quickjump">
        {categories.map((category) => <a key={category._id} href={`#${category.slug}`}>{category.emoji} {category.name}</a>)}
        <a href="#student-life">💡 Student Life &amp; Tips</a>
        <a href="#tmu-links">🔗 TMU Links</a>
      </div>

      <main id="main-content">
        {loading && <p className="notice" role="status">Loading the resource directory…</p>}
        {error && <p className="notice error" role="alert">{error}</p>}
        {!loading && !error && groupedResources.map((category) => category.resources.length > 0 && (
          <section className="category" id={category.slug} key={category._id}>
            <div className="category-head">
              <h2>{category.emoji} {category.name}</h2>
              <span className="count">{category.resources.length} resources</span>
            </div>
            <p className="category-desc">{category.description}</p>
            <div className="resource-list">
              {category.resources.map((resource) => (
                <article className="resource-row" key={resource._id}>
                  <div className="resource-main">
                    <h3><a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.name}</a></h3>
                    <p>{resource.description}</p>
                  </div>
                  {resource.tag && <span className="resource-tag">{resource.tag}</span>}
                </article>
              ))}
            </div>
          </section>
        ))}
        {!loading && !error && visibleResourceCount === 0 && (
          <p className="empty-state">No resources match your search. <button onClick={clearSearch}>Clear the search</button> and browse by category instead.</p>
        )}
      </main>

      <section className="tips" id="student-life">
        <div className="tips-inner">
          <h2>From students, for students</h2>
          <p className="sub">Real advice collected from TMU students during early interviews for this project. Submit your own once the contribution form is connected.</p>
          <div className="tip-card">
            <blockquote>“{tips[tipIndex].text}”</blockquote>
            <cite>— {tips[tipIndex].source}</cite>
            <div className="tip-controls">
              <button aria-label="Previous tip" onClick={() => setTipIndex((tipIndex - 1 + tips.length) % tips.length)}>←</button>
              <button aria-label="Next tip" onClick={() => setTipIndex((tipIndex + 1) % tips.length)}>→</button>
              <span className="tip-count">{tipIndex + 1} of {tips.length}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contribute">
        <div className="contribute-inner">
          <div><h3>Know a resource that should be here?</h3><p>This directory only works if it stays current. Suggest a link, a course guide, or a tip.</p></div>
          <button className="btn" type="button" disabled title="The submission form will be added when its requirements are ready.">Suggestion form coming soon</button>
        </div>
      </section>

      <footer id="tmu-links">
        <div className="footer-inner">
          <div className="footer-grid">
            <div><h4>Study Hub</h4><p>An independent, student-built directory for TMU. Not officially affiliated with Toronto Metropolitan University — links point to official university systems where noted.</p></div>
            <div><h4>Categories</h4><ul>{categories.map((category) => <li key={category._id}><a href={`#${category.slug}`}>{category.name}</a></li>)}</ul></div>
            <div><h4>Official TMU</h4><ul>
              <li><a href="https://www.torontomu.ca/" target="_blank" rel="noopener noreferrer">TMU homepage</a></li>
              <li><a href="https://www.torontomu.ca/library/" target="_blank" rel="noopener noreferrer">TMU Library</a></li>
              <li><a href="https://www.torontomu.ca/current-students/" target="_blank" rel="noopener noreferrer">Current students portal</a></li>
              <li><a href="https://www.torontomu.ca/career-boost/" target="_blank" rel="noopener noreferrer">Career Boost</a></li>
            </ul></div>
          </div>
          <div className="footer-bottom"><span>Study Hub · Student resource directory</span><span>Built with React, Express &amp; MongoDB</span></div>
        </div>
      </footer>
    </>
  );
}

export default App;
