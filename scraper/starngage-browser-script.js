// StarNgage Influencer Scraper - Browser Console Script
// Instructions:
// 1. Open StarNgage in your browser: https://starngage.com/plus/en-us/influencer/ranking/instagram/spain?page=31
// 2. Open Developer Tools (F12 or Cmd+Option+I on Mac)
// 3. Go to the Console tab
// 4. Copy and paste this entire script
// 5. Press Enter to run it
// 6. The script will automatically paginate through all pages starting from page 31
// 7. When complete, it will download a CSV file with all the data

(async function scrapeStarNgage() {
    const allInfluencers = [];
    let currentPage = 31;
    let hasMorePages = true;
    
    console.log('🚀 Starting StarNgage scraper from page 31...');
    
    while (hasMorePages) {
        console.log(`📄 Scraping page ${currentPage}...`);
        
        // Wait for the table to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Find all influencer rows in the table
        const rows = document.querySelectorAll('tbody tr');
        
        if (rows.length === 0) {
            console.log('❌ No more data found. Stopping...');
            hasMorePages = false;
            break;
        }
        
        // Extract data from each row
        rows.forEach((row, index) => {
            try {
                // Get the rank number from the first column
                const rankCell = row.querySelector('td:first-child');
                const rank = rankCell ? rankCell.textContent.trim() : '';
                
                // Get name and handle
                const nameCell = row.querySelectorAll('td')[1];
                const nameElement = nameCell ? nameCell.querySelector('.text-black') : null;
                const handleElement = nameCell ? nameCell.querySelector('.text-purple-600, .text-pink-600, [class*="purple"], [class*="pink"]') : null;
                
                const name = nameElement ? nameElement.textContent.trim() : '';
                const handle = handleElement ? handleElement.textContent.trim() : '';
                
                // Get followers
                const followersCell = row.querySelectorAll('td')[2];
                const followers = followersCell ? followersCell.textContent.trim() : '';
                
                // Get engagement rate
                const erCell = row.querySelectorAll('td')[3];
                const engagementRate = erCell ? erCell.textContent.trim() : '';
                
                // Get topics/genres (multiple tags)
                const topicsCell = row.querySelectorAll('td')[5];
                let topics = '';
                if (topicsCell) {
                    const topicTags = topicsCell.querySelectorAll('.badge, .tag, [class*="rounded"], .bg-gray-100');
                    const topicArray = Array.from(topicTags).map(tag => tag.textContent.trim()).filter(t => t.length > 0);
                    topics = topicArray.join('');
                }
                
                if (name && handle) {
                    allInfluencers.push({
                        rank: rank,
                        name: name,
                        followers: followers,
                        engagementRate: engagementRate,
                        country: 'Spain',
                        genre: topics,
                        demographics: '',
                        instagramHandle: handle
                    });
                }
            } catch (error) {
                console.error(`Error extracting row ${index}:`, error);
            }
        });
        
        console.log(`✅ Extracted ${rows.length} influencers from page ${currentPage}`);
        console.log(`📊 Total collected: ${allInfluencers.length} influencers`);
        
        // Try to find and click the next page button
        const nextButton = document.querySelector('button[aria-label="Next page"], button:has(svg):last-of-type, .pagination button:last-child, a[rel="next"]');
        
        if (nextButton && !nextButton.disabled && !nextButton.classList.contains('disabled')) {
            // Check if we're on the last page by looking at pagination
            const currentPageIndicator = document.querySelector('.bg-pink-500, [class*="active"]');
            const allPageButtons = document.querySelectorAll('.pagination button, .pagination a, [role="navigation"] button');
            
            // If this is the last page button that's active, stop
            if (allPageButtons.length > 0) {
                const lastPageButton = Array.from(allPageButtons).filter(btn => !isNaN(parseInt(btn.textContent)))[allPageButtons.length - 1];
                if (lastPageButton && currentPageIndicator && 
                    lastPageButton.textContent.trim() === currentPageIndicator.textContent.trim()) {
                    console.log('📍 Reached the last page!');
                    hasMorePages = false;
                    break;
                }
            }
            
            nextButton.click();
            currentPage++;
            
            // Wait for the next page to load
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            console.log('📍 No more pages available.');
            hasMorePages = false;
        }
        
        // Safety limit to prevent infinite loops
        if (currentPage > 200) {
            console.log('⚠️ Reached safety limit of 200 pages');
            hasMorePages = false;
        }
    }
    
    console.log(`\n🎉 Scraping complete! Total influencers collected: ${allInfluencers.length}`);
    
    // Convert to CSV
    const csvHeader = 'Rank,Name ,Followers,Engagement Rate,Country,GENRE,Demographics,Instagram Handle\n';
    const csvRows = allInfluencers.map(inf => {
        return `${inf.rank},"${inf.name}",${inf.followers},${inf.engagementRate},${inf.country},${inf.genre},${inf.demographics},${inf.instagramHandle}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'starngage_influencers_scraped.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('💾 CSV file downloaded as "starngage_influencers_scraped.csv"');
    console.log('\n📋 Preview of first 5 influencers:');
    console.table(allInfluencers.slice(0, 5));
    
    return allInfluencers;
})();

