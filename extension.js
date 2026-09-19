// Roam Preview Overlay (Cmd + hover), single level, persistent iframe

const HOVER_DELAY = 250; // ms to keep hovering before the window opens
const LINK_SELECTOR =
  "span.rm-page-ref, a.rm-alias--page, span.rm-block-ref, span.rm-attr-ref";

// ---------- helpers ----------
function isTopWindow() {
  try {
    return window === window.parent;
  } catch (e) {
    return false;
  }
}

function graphName() {
  return window.roamAlphaAPI.graph.name;
}

function baseUrl() {
  return "https://roamresearch.com/#/app/" + graphName();
}

function urlFor(uid) {
  return baseUrl() + (uid ? "/page/" + uid : "");
}

function getUidFromLink(link) {
  if (link.classList.contains("rm-block-ref")) {
    return link.getAttribute("data-uid");
  }
  const withUid = link.closest("[data-link-uid]");
  return withUid ? withUid.getAttribute("data-link-uid") : null;
}

// ---------- overlay (created ONCE, then only shown/hidden) ----------
let overlayEl = null;
let rmIframe = null;
let currentUid = null;

function buildOverlay() {
  if (overlayEl) return;

  const cls = "preview-window";
  overlayEl = document.createElement("div");
  overlayEl.id = "preview-window-overlay";
  overlayEl.style.display = "none";
  overlayEl.innerHTML =
    '<div aria-live="polite" class="bp3-overlay bp3-overlay-open bp3-overlay-scroll-container">' +
      '<div tabindex="0" class="bp3-overlay-enter-done"></div>' +
      '<div class="bp3-overlay-backdrop rm-modal-backdrop rm-modal-backdrop--' + cls + ' bp3-overlay-enter-done"></div>' +
      '<div class="bp3-dialog-container bp3-overlay-content bp3-overlay-enter-done">' +
        '<div class="bp3-dialog rm-modal-dialog rm-modal-dialog--' + cls + '" role="dialog"></div>' +
      '</div>' +
      '<div tabindex="0" class="bp3-overlay-enter-done"></div>' +
    '</div>';

  const dialog = overlayEl.querySelector(".rm-modal-dialog--" + cls);
  dialog.style.width = "80vw";
  dialog.style.height = "80vh";

  const container = document.createElement("div");
  container.id = "container-preview-window";
  container.style.width = "100%";
  container.style.height = "100%";

  rmIframe = document.createElement("iframe");
  rmIframe.src = baseUrl(); // loaded once, at startup
  rmIframe.style.width = "100%";
  rmIframe.style.height = "100%";
  rmIframe.style.borderRadius = "5px";
  rmIframe.style.border = "none";

  container.appendChild(rmIframe);
  dialog.appendChild(container);
  document.body.appendChild(overlayEl);

  overlayEl
    .querySelector(".rm-modal-backdrop--" + cls)
    .addEventListener("click", closePreviewWindow);
}

function navigateIframe(uid) {
  if (uid === currentUid) return; // already showing this page/block
  currentUid = uid;
  const url = urlFor(uid);
  try {
    // hash change only: the SPA navigates, the graph does NOT reload
    rmIframe.contentWindow.location.hash = url.substring(url.indexOf("#"));
  } catch (e) {
    rmIframe.src = url; // fallback
  }
}

function openPreviewWindow(uid) {
  buildOverlay();
  navigateIframe(uid);
  overlayEl.style.display = "block";
}

function closePreviewWindow() {
  if (overlayEl) overlayEl.style.display = "none"; // hide, don't destroy
}

function isOpen() {
  return overlayEl && overlayEl.style.display !== "none";
}

// ---------- hover handling ----------
let hoverTimer = null;
let hoveredLink = null;

function clearHoverTimer() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
}

function scheduleOpen(link) {
  clearHoverTimer();
  const uid = getUidFromLink(link);
  if (!uid) return;
  hoverTimer = setTimeout(() => {
    hoverTimer = null;
    openPreviewWindow(uid);
  }, HOVER_DELAY);
}

function onMouseOver(event) {
  const link = event.target.closest && event.target.closest(LINK_SELECTOR);
  if (!link || link === hoveredLink) return;
  hoveredLink = link;
  if (event.metaKey) scheduleOpen(link);
}

function onMouseOut(event) {
  if (!hoveredLink) return;
  if (event.relatedTarget && hoveredLink.contains(event.relatedTarget)) return;
  hoveredLink = null;
  clearHoverTimer();
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    closePreviewWindow();
    return;
  }
  if (event.key === "Meta" && hoveredLink && !isOpen()) {
    scheduleOpen(hoveredLink);
  }
}

// ---------- topbar button ----------
let topbarBtn = null;
let editBlockUid = "";

function addTopbarButton() {
  const topbar = document.querySelector(".rm-topbar");
  if (!topbar) return;

  topbarBtn = document.createElement("span");
  topbarBtn.className = "rm-preview-window";
  topbarBtn.innerHTML =
    '<span aria-haspopup="true" class="bp3-popover-target">' +
    '<span class="bp3-button bp3-minimal bp3-icon-applications bp3-small" tabindex="0"></span>' +
    "</span>";
  topbar.appendChild(topbarBtn);

  topbarBtn.addEventListener("mousedown", () => {
    const ta = document.querySelector("textarea");
    editBlockUid = ta ? ta.id.slice(-9) : "";
  });
  topbarBtn.addEventListener("click", () => openPreviewWindow(editBlockUid));
}

// ---------- lifecycle ----------
function load() {
  // single level only: never run inside the preview iframe
  if (!isTopWindow()) return;
  // skip mobile / tablet
  if (window.innerWidth <= 800) return;

  if (window.__roamPreviewPlugin) window.__roamPreviewPlugin.unload();

  document.addEventListener("mouseover", onMouseOver, true);
  document.addEventListener("mouseout", onMouseOut, true);
  document.addEventListener("keydown", onKeyDown, true);
  addTopbarButton();
  buildOverlay(); // preload the graph once so the first hover is instant

  window.__roamPreviewPlugin = { unload };
}

function unload() {
  document.removeEventListener("mouseover", onMouseOver, true);
  document.removeEventListener("mouseout", onMouseOut, true);
  document.removeEventListener("keydown", onKeyDown, true);
  clearHoverTimer();
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
    rmIframe = null;
  }
  currentUid = null;
  if (topbarBtn) {
    topbarBtn.remove();
    topbarBtn = null;
  }
  hoveredLink = null;
  window.__roamPreviewPlugin = null;
}

export default {
  onload: load,
  onunload: unload,
};
