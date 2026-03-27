const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function restoreDatabase() {
  const marker = path.join(__dirname, '../db_restored.txt');

  if (fs.existsSync(marker)) {
    console.log("DB already restored ✅");
    return;
  }

  console.log("Restoring database...");

  const dumpPath = path.join(__dirname, '../dump/test');

  const command = `"C:\\Users\\HP\\Downloads\\mongodb-database-tools-windows-x86_64-100.15.0\\mongodb-database-tools-windows-x86_64-100.15.0\\bin\\mongorestore.exe" --db test "${dumpPath}"`;

  console.log("Running:", command);

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.log("Restore failed ❌");
      console.log(err);
      return;
    }

    console.log(stdout);
    console.log("Database restored ✅");

    fs.writeFileSync(marker, "done");
  });
}

module.exports = restoreDatabase;