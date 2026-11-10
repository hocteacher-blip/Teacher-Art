import JSZip from 'jszip';
import { LectureType } from '../types/lms';

export interface ParsedPackageResult {
  type: LectureType;
  title: string;
  entryPoint: string;
  scormVersion?: '1.2' | '2004';
  filesCount: number;
  filesList: string[];
  manifestXml?: string;
  blobUrls: Record<string, string>;
  mainLaunchUrl: string;
}

/**
 * Parses an uploaded ZIP file for SCORM or HTML5 packages
 */
export async function parseElearningZip(file: File): Promise<ParsedPackageResult> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const fileNames = Object.keys(loadedZip.files).filter(name => !loadedZip.files[name].dir);
  const blobUrls: Record<string, string> = {};

  // Check for imsmanifest.xml
  const manifestFileName = Object.keys(loadedZip.files).find(
    name => name.toLowerCase().endsWith('imsmanifest.xml')
  );

  let type: LectureType = 'html5';
  let title = file.name.replace(/\.[^/.]+$/, '');
  let entryPoint = 'index.html';
  let scormVersion: '1.2' | '2004' | undefined = undefined;
  let manifestXml: string | undefined = undefined;

  if (manifestFileName) {
    type = 'scorm12';
    manifestXml = await loadedZip.files[manifestFileName].async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(manifestXml, 'text/xml');

    // Detect version
    const schemaVersionEl = xmlDoc.querySelector('schemaversion');
    if (schemaVersionEl && schemaVersionEl.textContent) {
      if (schemaVersionEl.textContent.includes('2004')) {
        scormVersion = '2004';
        type = 'scorm2004';
      } else {
        scormVersion = '1.2';
        type = 'scorm12';
      }
    } else {
      scormVersion = '1.2';
    }

    // Extract title
    const titleEl = xmlDoc.querySelector('organization > title') || xmlDoc.querySelector('item > title');
    if (titleEl && titleEl.textContent?.trim()) {
      title = titleEl.textContent.trim();
    }

    // Extract resource href
    const resourceEl = xmlDoc.querySelector('resource[href]');
    if (resourceEl) {
      entryPoint = resourceEl.getAttribute('href') || 'index.html';
    }
  } else {
    // Look for index.html or *.html
    const indexFile = fileNames.find(n => n.toLowerCase().endsWith('index.html')) || 
                      fileNames.find(n => n.toLowerCase().endsWith('.html'));
    if (indexFile) {
      entryPoint = indexFile;
      type = 'html5';
    }
  }

  // Pre-generate blob URLs for files in package
  for (const filename of fileNames) {
    try {
      const fileObj = loadedZip.files[filename];
      const mime = getMimeType(filename);
      const blob = await fileObj.async('blob');
      const blobWithMime = new Blob([blob], { type: mime });
      blobUrls[filename] = URL.createObjectURL(blobWithMime);
    } catch (e) {
      console.warn('Could not extract blob for file', filename, e);
    }
  }

  // Determine launch URL
  let mainLaunchUrl = '';
  // Find exact key or relative key
  const exactKey = Object.keys(blobUrls).find(
    k => k === entryPoint || k.endsWith('/' + entryPoint) || k.toLowerCase().endsWith(entryPoint.toLowerCase())
  );
  if (exactKey) {
    mainLaunchUrl = blobUrls[exactKey];
  } else {
    // Fallback to first html file or root
    const anyHtml = Object.keys(blobUrls).find(k => k.endsWith('.html'));
    mainLaunchUrl = anyHtml ? blobUrls[anyHtml] : Object.values(blobUrls)[0] || '';
  }

  return {
    type,
    title,
    entryPoint,
    scormVersion,
    filesCount: fileNames.length,
    filesList: fileNames,
    manifestXml,
    blobUrls,
    mainLaunchUrl,
  };
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'text/html';
    case 'js':
      return 'application/javascript';
    case 'css':
      return 'text/css';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'mp4':
      return 'video/mp4';
    case 'mp3':
      return 'audio/mpeg';
    case 'json':
      return 'application/json';
    case 'xml':
      return 'text/xml';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Creates a valid standalone SCORM 1.2 zip sample package for testing primary school Tin học
 */
export async function generateDemoScormZipBlob(title: string, grade: number, subject: string): Promise<Blob> {
  const zip = new JSZip();

  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST_ELEMS_${Date.now()}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ELEMS_ORG">
    <organization identifier="ELEMS_ORG">
      <title>${title} (Lớp ${grade} - ${subject})</title>
      <item identifier="ITEM_1" identifierref="RES_1">
        <title>${title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html" />
    </resource>
  </resources>
</manifest>`;

  const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); color: #1e293b; }
    .card { background: white; border-radius: 16px; padding: 28px; max-width: 680px; margin: 20px auto; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 2px solid #bbf7d0; }
    h1 { color: #15803d; font-size: 24px; margin-top: 0; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 13px; }
    .btn { background: #16a34a; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 16px; margin-top: 16px; transition: all 0.2s; }
    .btn:hover { background: #15803d; transform: translateY(-1px); }
    .status { margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 14px; border: 1px dashed #cbd5e1; }
    .key-tip { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Gói SCORM 1.2 Chuẩn Quốc Tế</span>
    <h1>${title}</h1>
    <p>Chào mừng các em học sinh đến với bài giảng e-learning tương tác! Bài giảng này đã kết nối thành công với Hệ thống LMS E-LEARNING SCHOOL thông qua <b>SCORM 1.2 Runtime API</b>.</p>
    
    <div class="key-tip">
      💡 <b>Ghi nhớ dành cho học sinh:</b> Hãy tập trung theo dõi các nội dung và bấm nút "Hoàn thành bài giảng" bên dưới khi học xong để đồng bộ điểm số về cho thầy cô.
    </div>

    <div class="status" id="scormStatus">
      🔌 Trạng thái kết nối LMS: <b style="color: #16a34a;">Đang kết nối...</b>
    </div>

    <button class="btn" id="btnFinish" onclick="completeScormLesson()">✅ Tôi đã học xong - Gửi kết quả về LMS</button>
  </div>

  <script>
    var api = null;
    function findAPI(win) {
      var findAttempts = 0;
      while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
        findAttempts++;
        if (findAttempts > 7) return null;
        win = win.parent;
      }
      return win.API;
    }

    window.onload = function() {
      api = findAPI(window) || (window.opener ? findAPI(window.opener) : null);
      var statusEl = document.getElementById('scormStatus');
      if (api) {
        api.LMSInitialize("");
        var studentName = api.LMSGetValue("cmi.core.student_name");
        statusEl.innerHTML = "🔌 Kết nối SCORM thành công! Học sinh: <b>" + (studentName || 'Học sinh tiểu học') + "</b>";
        api.LMSSetValue("cmi.core.lesson_status", "incomplete");
        api.LMSCommit("");
      } else {
        statusEl.innerHTML = "⚠️ Không tìm thấy SCORM API (Chế độ xem trước độc lập).";
      }
    };

    function completeScormLesson() {
      if (api) {
        api.LMSSetValue("cmi.core.score.raw", "100");
        api.LMSSetValue("cmi.core.lesson_status", "completed");
        api.LMSCommit("");
        api.LMSFinish("");
        alert("🎉 Chúc mừng em! Kết quả bài học (100 điểm) đã được ghi nhận trên E-LEARNING SCHOOL!");
        document.getElementById('btnFinish').innerText = "✨ Đã hoàn thành bài học";
        document.getElementById('btnFinish').disabled = true;
      } else {
        alert("Đã hoàn thành bài học!");
      }
    }
  </script>
</body>
</html>`;

  zip.file('imsmanifest.xml', manifest);
  zip.file('index.html', htmlContent);

  return await zip.generateAsync({ type: 'blob' });
}
