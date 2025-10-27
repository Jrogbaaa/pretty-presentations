// StarNgage Single Page Extractor
// Use this to extract data from the current page only
// Useful for testing or manual page-by-page extraction

(function extractCurrentPage() {
    const influencers = [];
    
    console.log('🔍 Extracting influencers from current page...');
    
    // Get current page number from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentPage = urlParams.get('page') || '1';
    console.log(`📄 Page: ${currentPage}`);
    
    // Find all influencer rows
    const rows = document.querySelectorAll('tbody tr');
    console.log(`Found ${rows.length} rows`);
    
    rows.forEach((row, index) => {
        try {
            // Get rank
            const rankCell = row.querySelector('td:first-child');
            const rank = rankCell ? rankCell.textContent.trim() : '';
            
            // Get name and handle (second column)
            const nameCell = row.querySelectorAll('td')[1];
            const nameElement = nameCell ? nameCell.querySelector('.text-black, div:first-child') : null;
            const handleElement = nameCell ? nameCell.querySelector('[class*="purple"], [class*="pink"], a') : null;
            
            const name = nameElement ? nameElement.textContent.trim() : '';
            let handle = handleElement ? handleElement.textContent.trim() : '';
            
            // Ensure handle starts with @
            if (handle && !handle.startsWith('@')) {
                handle = '@' + handle;
            }
            
            // Get followers (third column)
            const followersCell = row.querySelectorAll('td')[2];
            const followers = followersCell ? followersCell.textContent.trim() : '';
            
            // Get engagement rate (fourth column)
            const erCell = row.querySelectorAll('td')[3];
            const engagementRate = erCell ? erCell.textContent.trim() : '';
            
            // Get topics (sixth column, multiple badges)
            const topicsCell = row.querySelectorAll('td')[5];
            let topics = '';
            if (topicsCell) {
                const topicElements = topicsCell.querySelectorAll('span, .badge, div');
                const topicArray = Array.from(topicElements)
                    .map(el => el.textContent.trim())
                    .filter(t => t.length > 0 && t.length < 50); // Filter out empty and too long texts
                topics = topicArray.join('');
            }
            
            if (name && handle) {
                influencers.push({
                    rank,
                    name,
                    followers,
                    engagementRate,
                    country: 'Spain',
                    genre: topics,
                    demographics: '',
                    instagramHandle: handle
                });
                
                console.log(`✓ ${rank}. ${name} (${handle}) - ${followers} followers`);
            }
        } catch (error) {
            console.error(`Error on row ${index}:`, error);
        }
    });
    
    console.log(`\n✅ Extracted ${influencers.length} influencers`);
    
    // Convert to CSV
    const csvHeader = 'Rank,Name ,Followers,Engagement Rate,Country,GENRE,Demographics,Instagram Handle\n';
    const csvRows = influencers.map(inf => {
        // Escape quotes in name and genre
        const escapedName = inf.name.replace(/"/g, '""');
        const escapedGenre = inf.genre.replace(/"/g, '""');
        
        return `${inf.rank},"${escapedName}",${inf.followers},${inf.engagementRate},${inf.country},"${escapedGenre}",${inf.demographics},${inf.instagramHandle}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Copy to clipboard
    navigator.clipboard.writeText(csvContent).then(() => {
        console.log('📋 CSV data copied to clipboard!');
        console.log('\n📊 Preview:');
        console.table(influencers.slice(0, 5));
        console.log('\n💡 Paste this into a text file or spreadsheet');
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        console.log('\n📄 CSV Output:');
        console.log(csvContent);
    });
    
    return influencers;
})();

