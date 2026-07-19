try {
  const res = await fetch("https://portal-navy-five-30.vercel.app/control");
  const html = await res.text();
  console.log("Status:", res.status);
  console.log("Length:", html.length);
  const match = html.match(/control\.index-[a-zA-Z0-9_-]+\.js/);
  console.log("Matched script file in HTML:", match ? match[0] : "None");
  // Let's print all script and link modulepreloads:
  const preloads = html.match(/href="\/assets\/[^"]+"/g);
  console.log("Preloads found:", preloads);
} catch (err) {
  console.error(err);
}
