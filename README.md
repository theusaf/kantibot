# kahoot-antibot
The kahoot antibot found at https://greasyfork.org/en/scripts/374093-kahoot-antibot
<hr>
<h1>Kahoot AntiBot</h1>
<p>This script uses a "Levenshtein distance" formula to determine similarity, taken from <a href="https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely">Stackoverflow.com</a></p>
<hr>
<b><h1>INSTALLATION</h1></b>
<ol>
<li>In package.json, add "@theusaf/kahoot-antibot": "git+https://github.com/theusaf/kahoot-antibot.git#nodejs" as a dependency.</li>
<li>> npm i</li>
<li>Enjoy a bot-less game!</li>
</ol>
<hr>
<ul>
<li>This script will remove all players with a similarity rating of 60%</li>
<h2>Join our discord:</h2>
<a href="https://discord.gg/pPdvXU6"><img src="https://cdn.discordapp.com/icons/641133408205930506/31c023710d468520708d6defb32a89bc.png?size=128" alt="Kahoot Hacker Icon" height="100" width="100"></a>
<hr>
<h4>Note:</h4>
<ul>
<li>This script might kick actual players if their names are too similar to that of bots, or there is more than one player with a number name.</li>
<li>This script might kick players if botters maliciously set the name of the bots to be similar to an existing player.</li>
<li>
