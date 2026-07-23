const fs = require('fs');
const path = require('path');
const dir = 'c:/personales/Bizcochao/bizcochao facturacion/pasteleria-admin-app/components/modules';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;

  // Pattern for the early return loader
  const earlyReturnPattern = /if\s*\(\s*(isLoading|isFetching|isLoadingData)\s*\)\s*\{\s*return\s*\(\s*<div[^>]*>\s*<Loader\s*\/>\s*<\/div>\s*\)\s*\}/;
  const match = content.match(earlyReturnPattern);
  if (match) {
    const loadingVar = match[1];
    content = content.replace(earlyReturnPattern, '');
    
    // add import LoadingOverlay
    if (!content.includes('LoadingOverlay')) {
      if (content.includes('import { Loader } from "@/components/ui/loader"')) {
        content = content.replace('import { Loader } from "@/components/ui/loader"', 'import { Loader } from "@/components/ui/loader"\nimport { LoadingOverlay } from "@/components/ui/loading-overlay"');
      } else {
        content = content.replace(/(import .*? from .*?\n)/, '$1import { LoadingOverlay } from "@/components/ui/loading-overlay"\n');
      }
    }
    
    // make the main container relative
    // usually return ( \n <div className="flex flex-col gap-5">
    content = content.replace(/return\s*\(\s*<div\s+className="([^"]*)"/, (m, classNames) => {
      let newClasses = classNames;
      if (!newClasses.includes('relative')) newClasses += ' relative';
      if (!newClasses.includes('min-h-')) newClasses += ' min-h-[400px]';
      return `return (\n    <div className="${newClasses}">\n      <LoadingOverlay active={${loadingVar}} />`;
    });
    
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(p, content);
    console.log('Updated', file);
  }
}
