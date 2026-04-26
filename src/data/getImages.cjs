async function getImages() {
  const queries = [
    'cosmetics', 'sports equipment', 'baby clothes', 'groceries', 
    'kitchen appliances', 'pantry organization', 'cleaning supplies', 'pet dog', 'supermarket aisle'
  ];

  for (const query of queries) {
    try {
      const res = await fetch('https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=1', {
        headers: {
          'Authorization': '563492ad6f917000010000011e4bf5e0220a44f3801f46752d5b65ff'
        }
      });
      const data = await res.json();
      const url = data.photos[0].src.medium;
      console.log(`"${query}": "${url}"`);
    } catch (e) {
      console.log(`Error on ${query}`, e);
    }
  }
}

getImages();
