const QUOTES_URL = "quotes.yaml";

const grid = document.getElementById("tweet-grid");
const loading = document.getElementById("loading");

const showStatus = (message) => {
  if (!loading) {
    return;
  }
  loading.textContent = message;
  loading.style.display = "block";
};

const hideStatus = () => {
  if (!loading) {
    return;
  }
  loading.style.display = "none";
};

const renderEmptyState = () => {
  showStatus("No tweets found. Add URLs in quotes.yaml.");
};

const renderError = (error) => {
  showStatus(`Could not load tweets. ${error}`);
};

const buildTweetCard = (quote, index) => {
  const card = document.createElement("div");
  card.className = "tweet-card is-visible";
  card.style.setProperty("--delay", `${index * 90}ms`);

  const blockquote = document.createElement("blockquote");
  blockquote.className = "twitter-tweet";

  const link = document.createElement("a");
  link.href = quote.url;
  link.textContent = quote.label || quote.url;

  blockquote.appendChild(link);
  card.appendChild(blockquote);
  return card;
};

const loadTwitterWidgets = () => {
  if (window.twttr && window.twttr.widgets) {
    window.twttr.widgets.load(grid);
    return;
  }

  const script = document.getElementById("twitter-wjs");
  if (!script) {
    return;
  }

  script.addEventListener("load", () => {
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(grid);
    }
  });
};

const renderTweets = (quotes) => {
  grid.innerHTML = "";
  quotes.forEach((quote, index) => {
    if (!quote || !quote.url) {
      return;
    }
    grid.appendChild(buildTweetCard(quote, index));
  });

  if (!grid.children.length) {
    renderEmptyState();
    return;
  }

  hideStatus();
  loadTwitterWidgets();
};

const loadQuotes = async () => {
  if (!window.jsyaml) {
    renderError("Missing YAML parser.");
    return;
  }

  try {
    const response = await fetch(QUOTES_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    const data = window.jsyaml.load(text);
    const quotes = data && Array.isArray(data.quotes) ? data.quotes : [];
    if (!quotes.length) {
      renderEmptyState();
      return;
    }
    renderTweets(quotes);
  } catch (error) {
    renderError(error.message);
  }
};

loadQuotes();
