import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";

/**
 * For web:
 *  - If base64Data is present, we show data URI
 *  - If not, we show `uri` (direct link)
 *
 * For mobile:
 *  - We always convert base64Data to an HTML string using PDF.js with Outline.
 *  - The Outline panel is displayed, letting you jump to pages by clicking items.
 */
export default function PdfViewer({ base64Data, uri }) {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      // Web: no extra HTML needed, we do direct or data URI in <iframe>
      return;
    }
    // Mobile: if we have base64Data, generate custom HTML
    if (base64Data) {
      const customHtml = createPdfHtmlWithOutline(base64Data);
      setHtml(customHtml);
    }
  }, [base64Data]);

  // If web:
  if (Platform.OS === "web") {
    // If base64Data is available => data URI
    if (base64Data) {
      return (
        <iframe
          src={`data:application/pdf;base64,${base64Data}`}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="PDF Viewer"
        />
      );
    }
    // else if we have a direct URL
    else if (uri) {
      return (
        <iframe
          src={uri}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="PDF Viewer"
        />
      );
    }
    // else no PDF
    else {
      return <Text>No PDF available.</Text>;
    }
  }

  // If mobile but no base64 => still loading
  if (!base64Data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#283593" />
      </View>
    );
  }

  // If mobile & we haven't generated HTML yet => show spinner
  if (!html) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#283593" />
      </View>
    );
  }

  // If mobile & we have custom HTML => show in WebView
  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={styles.webview}
      mixedContentMode="always"
    />
  );
}

/**
 * PDF.js code with Outline:
 *  - page-by-page rendering
 *  - getOutline() => side panel
 *  - click item => jump to page
 */
function createPdfHtmlWithOutline(base64) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body {
      margin: 0; padding: 0; background: #ccc;
      font-family: sans-serif;
    }
    #outlinePanel {
      position: fixed;
      top: 0; left: 0;
      width: 180px;
      height: 100%;
      background: #f0f0f0;
      overflow-y: auto;
      border-right: 1px solid #999;
    }
    #outlinePanel h3 {
      margin: 0; padding: 10px;
      background: #ccc;
      font-size: 14px;
    }
    .outlineItem {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
      cursor: pointer;
    }
    .outlineItem:hover {
      background: #eee;
    }
    #pdfContainer {
      margin-left: 180px; /* space for outline */
    }
    .pageCanvas {
      display: block;
      margin: 10px auto;
      background: #fff;
    }
  </style>
  <!-- PDF.js scripts -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"></script>
</head>
<body>
  <div id="outlinePanel">
    <h3>Document Outline</h3>
    <div id="outlineItems"></div>
  </div>
  <div id="pdfContainer"></div>

  <script>
    (function() {
      var pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

      // decode base64
      var raw = atob('${base64}');
      var uint8Array = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
      }

      // load PDF
      var loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      var pdfDoc = null;
      var totalPages = 0;

      loadingTask.promise.then(function(pdf) {
        pdfDoc = pdf;
        totalPages = pdf.numPages;

        // start rendering from page 1
        renderPage(1);

        // fetch outline
        pdf.getOutline().then(function(outline) {
          if(!outline || !outline.length) {
            document.getElementById('outlineItems').innerHTML =
              '<p style="padding:10px;font-size:13px;">No Outline found.</p>';
            return;
          }
          var outlineItemsDiv = document.getElementById('outlineItems');
          outline.forEach(function(item) {
            var div = document.createElement('div');
            div.className = 'outlineItem';
            div.textContent = item.title;
            div.onclick = function() {
              // jump to page via getDestination
              pdf.getDestination(item.dest).then(function(destArray) {
                if(!destArray) return;
                pdf.getPageIndex(destArray[0]).then(function(pageIndex) {
                  // pageIndex is 0-based
                  renderPage(pageIndex + 1);
                });
              });
            };
            outlineItemsDiv.appendChild(div);
          });
        });
      }).catch(function(err) {
        document.body.innerHTML = '<h3 style="color:red;">Error loading PDF: ' + err.message + '</h3>';
      });

      // Render page function
      function renderPage(pageNum) {
        pdfDoc.getPage(pageNum).then(function(page) {
          var scale = 1.0;
          var viewport = page.getViewport({ scale: scale });

          // Clear container first
          var pdfContainer = document.getElementById('pdfContainer');
          pdfContainer.innerHTML = '';

          // If you want to only show from "pageNum" to the end, do a loop
          // Or if you want to show only 1 page at a time, just do that.
          for(let p = pageNum; p <= totalPages; p++) {
            renderSinglePage(pdfDoc, p);
          }
        });
      }

      function renderSinglePage(pdf, pageNum) {
        pdf.getPage(pageNum).then(function(page) {
          var scale = 1.0;
          var viewport = page.getViewport({ scale: scale });

          var canvas = document.createElement('canvas');
          canvas.className = 'pageCanvas';
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          var pdfContainer = document.getElementById('pdfContainer');
          pdfContainer.appendChild(canvas);

          var ctx = canvas.getContext('2d');
          var renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          page.render(renderContext);
        });
      }
    })();
  </script>
</body>
</html>
  `;
}

function createPdfHtml(base64) {
  // Fallback if you want a simpler version with no outline:
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin: 0; padding: 0; background: #ccc; }
    .pageCanvas {
      display: block;
      margin: 10px auto;
      background: #fff;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"></script>
</head>
<body>
  <div id="container"></div>
  <script>
    (function() {
      var pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

      var raw = atob('${base64}');
      var uint8Array = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
      }

      pdfjsLib.getDocument({ data: uint8Array }).promise.then(function(pdf) {
        var totalPages = pdf.numPages;
        function renderPage(pageNum) {
          pdf.getPage(pageNum).then(function(page) {
            var scale = 1.0;
            var viewport = page.getViewport({ scale: scale });

            var canvas = document.createElement('canvas');
            canvas.className = 'pageCanvas';
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            document.getElementById('container').appendChild(canvas);

            var ctx = canvas.getContext('2d');
            page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {
              if (pageNum < totalPages) {
                renderPage(pageNum + 1);
              }
            });
          });
        }
        renderPage(1);
      }).catch(function(err) {
        document.body.innerHTML = '<h3 style="color:red;">Error loading PDF: ' + err.message + '</h3>';
      });
    })();
  </script>
</body>
</html>
  `;
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
