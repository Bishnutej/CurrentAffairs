document.addEventListener('DOMContentLoaded', function() {
  const articlesDiv = document.getElementById('articles');
  const topicFilter = document.getElementById('topic-filter');
  const dateFilter = document.getElementById('date-filter');
  const searchInput = document.getElementById('search-input');
  const monthFilter = document.getElementById('month-filter');
  const weekFilter = document.getElementById('week-filter');

  let articles = [];

  fetch('assets/data/data.json')
    .then(response => response.json())
    .then(data => {
      articles = data;
      populateArticles(articles);
      populateTopics(articles);
      const today = new Date().toISOString().split('T')[0];
      dateFilter.value = today;
      filterArticles();
    })
    .catch(error => console.error('Error fetching articles:', error));

  topicFilter.addEventListener('change', filterArticles);
  dateFilter.addEventListener('change', filterArticles);
  searchInput.addEventListener('input', filterArticles);
  monthFilter.addEventListener('change', filterArticles);
  monthFilter.addEventListener('change', updateWeeks);
  weekFilter.addEventListener('change', filterArticles);

  function updateWeeks() {
    const selectedMonth = monthFilter.value;
    let daysInMonth;

    if (selectedMonth) {
      daysInMonth = new Date(2024, selectedMonth, 0).getDate();
    } else {
      daysInMonth = 31; // Default maximum days
    }

    weekFilter.innerHTML = '<option value="">All Weeks</option>';
    if (daysInMonth >= 7) weekFilter.innerHTML += '<option value="1-7">1st Week (1-7)</option>';
    if (daysInMonth >= 14) weekFilter.innerHTML += '<option value="8-14">2nd Week (8-14)</option>';
    if (daysInMonth >= 21) weekFilter.innerHTML += '<option value="15-21">3rd Week (15-21)</option>';
    if (daysInMonth > 21) weekFilter.innerHTML += `<option value="22-${daysInMonth}">4th Week (22-${daysInMonth})</option>`;
  }

  function populateArticles(data) {
    articlesDiv.innerHTML = '';
    data.forEach(article => {
      const articleDiv = document.createElement('div');
      articleDiv.classList.add('card');
      articleDiv.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${article.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${article.date} - ${article.topic}</h6>
          ${formatPoints(article.points)}
        </div>
      `;
      articlesDiv.appendChild(articleDiv);
    });
  }

  function formatPoints(points) {
    const ul = document.createElement('ul');
    points.forEach(point => {
      const li = document.createElement('li');
      if (typeof point === 'string') {
        li.textContent = point;
      } else if (typeof point === 'object') {
        for (const [key, value] of Object.entries(point)) {
          li.innerHTML = `${key}: ${value}`;
        }
      }
      ul.appendChild(li);
    });
    return ul.outerHTML;
  }

  function populateTopics(data) {
    const topics = new Set(data.map(article => article.topic));
    topics.forEach(topic => {
      const option = document.createElement('option');
      option.value = topic;
      option.textContent = topic;
      topicFilter.appendChild(option);
    });
  }

  function filterArticles() {
    const filteredArticles = articles.filter(article => {
      const matchesTopic = topicFilter.value ? article.topic === topicFilter.value : true;
      const matchesDate = dateFilter.value ? article.date === dateFilter.value : true;
      const matchesMonth = monthFilter.value ? new Date(article.date).getMonth() + 1 == monthFilter.value : true;
      const matchesWeek = weekFilter.value ? checkWeek(article.date, weekFilter.value) : true;
      const matchesSearch = article.title.toLowerCase().includes(searchInput.value.toLowerCase()) || 
                            article.points.some(point => 
                              typeof point === 'string' 
                                ? point.toLowerCase().includes(searchInput.value.toLowerCase())
                                : Object.values(point).some(subPoint => subPoint.toLowerCase().includes(searchInput.value.toLowerCase()))
                            );
      return matchesTopic && matchesDate && matchesMonth && matchesWeek && matchesSearch;
    });

    populateArticles(filteredArticles);
  }

  function checkWeek(dateStr, weekRange) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const [start, end] = weekRange.split('-').map(Number);
    return day >= start && day <= end;
  }
});
