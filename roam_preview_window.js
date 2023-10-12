// Roam Preview Overlay

var graphName = window.roamAlphaAPI.graph.name;
var rmIframe;
var preview_overlay;
var edit_block_uid;
function loadPreviewWindow(){
    console.log("me: preview window has been loaded");

    var elementClass = "preview-window";
    var overlayDiv = document.createElement("div");
    overlayDiv.id = "preview-window-overlay";
    overlayDiv.innerHTML = '<div aria-live="polite" class="bp3-overlay bp3-overlay-open bp3-overlay-scroll-container"><div tabindex="0" class="bp3-overlay-enter-done"></div><div class="bp3-overlay-backdrop rm-modal-backdrop rm-modal-backdrop--' +
                            elementClass +
                            ' bp3-overlay-enter-done"></div><div class="bp3-dialog-container bp3-overlay-content bp3-overlay-enter-done"><div class="bp3-dialog rm-modal-dialog rm-modal-dialog--' +
                            elementClass +
                            '" role="dialog"></div></div><div tabindex="0" class="bp3-overlay-enter-done"></div></div>';

    overlayDiv.style.display = "none";
    document.body.append(overlayDiv);

    var ele = document.querySelector(" #preview-window-overlay .bp3-dialog-container .rm-modal-dialog--preview-window");
    ele.style.width = "80vw";
    ele.style.height = "80vh";

    var containerDiv = document.createElement("div");
    containerDiv.id = "container-preview-window";
    containerDiv.style.width = "100%";
    containerDiv.style.height = "100%";
    ele.appendChild(containerDiv);

    rmIframe = document.createElement("iframe");
    rmIframe.src = "https://roamresearch.com/#/app/" + graphName;
    rmIframe.style.width = "100%";
    rmIframe.style.height = "100%";
    rmIframe.style.borderRadius = "5px";
    rmIframe.style.border = "none";
    containerDiv.appendChild(rmIframe);
     
    var overlayPreviewWindow = document.querySelector(".bp3-overlay-backdrop.rm-modal-backdrop.rm-modal-backdrop--preview-window");
    overlayPreviewWindow.addEventListener("click", (event) => {
    closePreviewWindow();
    });
}

function openPreviewWindow() {
    
    if(preview_overlay){
        console.log("me: preview window has been opened");
        preview_overlay.style.display = "block";
    }
        
}


function closePreviewWindow() {
    preview_overlay = document.querySelector("#preview-window-overlay");
    if(preview_overlay){
        console.log("me: preview window has been closed");
        preview_overlay.style.display = "none";
    }
}




function abc() {
    var rmLinks = document.querySelectorAll(
      "span.rm-page-ref, a.rm-alias--page, span.rm-block-ref, span.rm-attr-ref"
    );

    rmLinks.forEach(function (link) {
      // Add the event listener for "mouseenter" (hover)
      link.addEventListener("mouseenter", function (event) {
        if (event.metaKey) {
          setPageUid(event.target);
        }
      });
    });

    var edit_block = document.querySelector('textarea');
    if( edit_block ){
        edit_block_uid = document.querySelector('textarea').id.slice(-9);
    } else {
        edit_block_uid = '';
    }

  }
setInterval(abc, 2000);

  function setPageUid(link) {
    console.log("me: preview window pageuid has been set");
    var pageUid = "";
    switch (true) {
      case link.classList.contains("rm-page-ref--tag") || link.classList.contains("rm-attr-ref"):
        pageUid = link.getAttribute("data-link-uid");
        break;
      case link.classList.contains("rm-page-ref--link") ||
        link.classList.contains("rm-page-ref--namespace"):
        pageUid = link.parentElement.getAttribute("data-link-uid");
        break;
      case link.classList.contains("rm-alias--page"):
        pageUid = link.getAttribute("data-link-uid");
        break;
      case link.classList.contains("rm-block-ref"):
        pageUid = link.getAttribute("data-uid");
        break;  
      default:
        // Handle other cases if needed
        break;
    }
    rmIframe.src = "https://roamresearch.com/#/app/" + graphName + "/page/" + pageUid;
      console.log("me: preview window iframe source has been set");
    //openPreviewWindow();  
    setTimeout(function () {
      openPreviewWindow();
    }, 500);
  }
  
  function load(){
    var icon = 'applications';
    var span = document.createElement("span");
    span.innerHTML = '<span aria-haspopup="true" class="bp3-popover-target"><span class="bp3-button bp3-minimal bp3-icon-' + icon + ' bp3-small" tabindex="0"></span></span></span>';
    document.querySelector(".rm-topbar").append(span);
    span.addEventListener("click", function(event){
        var edit_block = document.querySelector('textarea');
        if( edit_block_uid != '' ){
            rmIframe.src = "https://roamresearch.com/#/app/" + graphName + '/page/'+ edit_block_uid;
        } else {
            rmIframe.src = "https://roamresearch.com/#/app/" + graphName;
        }    
        
        setTimeout(function () {
            openPreviewWindow();
        }, 500);
        
    });
    
    
    loadPreviewWindow();
    preview_overlay = document.querySelector("#preview-window-overlay");
    
}

function unload(){
    var div = document.querySelector(' #preview-window-overlay ');
    div.remove();
}

export default {
    onload: load,
    onunload: unload
  }
