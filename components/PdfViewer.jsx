import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";

export default function PdfViewer({ base64Data, uri }) {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    if (base64Data) {
      const customHtml = createPdfHtmlWithOutline(base64Data);
      setHtml(customHtml);
    }
  }, [base64Data]);

  if (Platform.OS === "web") {
    if (base64Data) {
      return (
        <iframe
          src={`data:application/pdf;base64,${base64Data}`}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="PDF Viewer"
        />
      );
    } else if (uri) {
      return (
        <iframe
          src={uri}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="PDF Viewer"
        />
      );
    } else {
      return <Text>No PDF available.</Text>;
    }
  }

  if (!base64Data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#283593" />
      </View>
    );
  }

  if (!html) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#283593" />
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={styles.webview}
      mixedContentMode="always"
    />
  );
}

function createPdfHtmlWithOutline(base64) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { margin: 0; padding: 0; background: #ccc; font-family: sans-serif; }
    #outlinePanel { position: fixed; top: 0; left: 0; width: 200px; height: 100%; background: #f0f0f0; overflow-y: auto; border-right: 1px solid #999; }
    #outlinePanel h3 { margin: 0; padding: 10px; background: #ccc; font-size: 14px; }
    .outlineItem { padding: 8px 10px; border-bottom: 1px solid #ddd; cursor: pointer; }
    .outlineItem:hover { background: #eee; }
    #pdfContainer { margin-left: 200px; overflow-y: auto; height: 100vh; }
    .pageCanvas { display: block; margin: 10px auto; background: #fff; }
  </style>
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
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

      var raw = atob('${base64}');
      var uint8Array = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
      }

      var loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      var pdfDoc = null;

      loadingTask.promise.then(function(pdf) {
        pdfDoc = pdf;
        renderAllPages();

        pdf.getOutline().then(function(outline) {
          if (!outline || !outline.length) {
            document.getElementById('outlineItems').innerHTML = '<p style="padding:10px;font-size:13px;">No Outline found.</p>';
            return;
          }
          var outlineItemsDiv = document.getElementById('outlineItems');
          outline.forEach(function(item) {
            var div = document.createElement('div');
            div.className = 'outlineItem';
            div.textContent = item.title;
            div.onclick = async function() {
              try {
                let pageIndex = null;
                if (item.dest) {
                  pageIndex = await pdf.getPageIndex(item.dest[0]);
                }
                if (pageIndex !== null) {
                  scrollToPage(pageIndex + 1);
                } else {
                  console.error("Page index not found for outline item", item);
                }
              } catch (error) {
                console.error("Error navigating to outline item:", error);
              }
            };
            outlineItemsDiv.appendChild(div);
          });
        });
      }).catch(function(err) {
        document.body.innerHTML = '<h3 style="color:red;">Error loading PDF: ' + err.message + '</h3>';
      });

      function renderAllPages() {
        for (let p = 1; p <= pdfDoc.numPages; p++) {
          renderSinglePage(pdfDoc, p);
        }
      }

      function renderSinglePage(pdf, pageNum) {
        pdf.getPage(pageNum).then(function(page) {
          var scale = 1.0;
          var viewport = page.getViewport({ scale: scale });

          var canvas = document.createElement('canvas');
          canvas.className = 'pageCanvas';
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.id = 'page-' + pageNum;

          var pdfContainer = document.getElementById('pdfContainer');
          pdfContainer.appendChild(canvas);

          var ctx = canvas.getContext('2d');
          var renderContext = { canvasContext: ctx, viewport: viewport };
          page.render(renderContext);
        });
      }

      function scrollToPage(pageNum) {
        var targetCanvas = document.getElementById('page-' + pageNum);
        if (targetCanvas) {
          targetCanvas.scrollIntoView({ behavior: 'smooth' });
        }
      }
    })();
  </script>
</body>
</html>
  `;
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
