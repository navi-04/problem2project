const keywords = {
    healthcare: ['Medical Devices', 'Telemedicine', 'Healthcare AI', 'Patient Care', 'Diagnostics'],
    technology: ['AI/ML', 'IoT', 'Cybersecurity', 'Cloud Computing', 'Blockchain'],
    environment: ['Renewable Energy', 'Waste Management', 'Climate Tech', 'Conservation', 'Sustainability'],
    education: ['EdTech', 'Online Learning', 'STEM', 'Assessment Tools', 'Educational Games'],
    agriculture: ['Smart Farming', 'Irrigation', 'Crop Management', 'AgriTech', 'Sustainable Agriculture'],
    finance: ['FinTech', 'Digital Banking', 'Blockchain', 'Payment Systems', 'Investment Tools']
};

let selectedCategory = '';

function toggleKeywords(category) {
    selectedCategory = category;
    const container = document.getElementById('keywords-container');
    const keywordsList = document.getElementById('keywords-list');
    
    keywordsList.innerHTML = '';
    
    keywords[category].forEach(keyword => {
        const keywordBtn = document.createElement('button');
        keywordBtn.className = 'bg-blue-100 text-blue-800 px-4 py-2 rounded-full hover:bg-blue-200 transition duration-300';
        keywordBtn.textContent = keyword;
        keywordBtn.onclick = () => fetchProblems(category, keyword);
        keywordsList.appendChild(keywordBtn);
    });
    
    container.classList.remove('hidden');
}

async function fetchProblems(category, keyword) {
    try {
        const response = await fetch('problems.json');
        const data = await response.json();
        
        const problems = data[category]?.[keyword] || [];
        displayProblems(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
    }
}

function displayProblems(problems) {
    const problemsSection = document.getElementById('problems');
    const problemsGrid = document.getElementById('problems-grid');
    
    problemsGrid.innerHTML = '';
    
    if (problems.length === 0) {
        problemsGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No problems found for this category and keyword.</p>';
    } else {
        problems.forEach(problem => {
            const card = createProblemCard(problem);
            problemsGrid.appendChild(card);
        });
    }
    
    problemsSection.classList.remove('hidden');
}

function createProblemCard(problem) {
    const card = document.createElement('div');
    card.className = 'bg-white p-6 rounded-lg shadow-md';
    card.innerHTML = `
        <h3 class="text-xl font-semibold mb-2">${problem.title}</h3>
        <p class="text-gray-600 mb-4">${problem.description}</p>
        <div class="flex justify-between items-center">
            <span class="text-blue-600">${problem.domain}</span>
            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">${problem.status}</span>
        </div>
    `;
    return card;
}

// Add contact form handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = {
        name: this.name.value,
        email: this.email.value,
        message: this.message.value
    };
    alert(`Form submitted!\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`);
    this.reset();
});

document.addEventListener('DOMContentLoaded', function() {
    const programmingBtn = document.getElementById('programmingBtn');
    const keywordsList = document.getElementById('keywordsList');

    // Get all unique keywords from the problems data
    function getUniqueKeywords() {
        fetch('problems_full.json')
            .then(response => response.json())
            .then(data => {
                const uniqueKeywords = new Set();
                data.forEach(problem => {
                    problem.keywords.forEach(keyword => uniqueKeywords.add(keyword));
                });
                displayKeywords(Array.from(uniqueKeywords));
            })
            .catch(error => console.error('Error:', error));
    }

    // Display keywords as tags
    function displayKeywords(keywords) {
        keywordsList.innerHTML = '';
        keywords.sort().forEach(keyword => {
            const keywordTag = document.createElement('span');
            keywordTag.className = 'keyword-tag';
            keywordTag.textContent = keyword;
            keywordsList.appendChild(keywordTag);
        });
    }

    // Add click event listener
    programmingBtn.addEventListener('click', getUniqueKeywords);
});
