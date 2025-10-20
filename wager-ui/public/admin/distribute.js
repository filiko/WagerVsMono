document.addEventListener('DOMContentLoaded', () => {
const resizableHeaders = document.querySelectorAll('th.resizable');
let currentResizingHeader = null;
let startX = 0;
let startWidth = 0;

resizableHeaders.forEach(header => {
    // Add resize handle to each header
    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    header.appendChild(resizeHandle);

    // Start resizing when the resize handle is clicked
    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.clientX;
        startWidth = header.offsetWidth;

        currentResizingHeader = header;
        document.addEventListener('mousemove', resizeColumn);
        document.addEventListener('mouseup', stopResize);
    });
});

// Function to resize the column
function resizeColumn(e) {
    if (currentResizingHeader) {
        const newWidth = startWidth + (e.clientX - startX);
        currentResizingHeader.style.width = `${newWidth}px`;
        resizeColumnCells(currentResizingHeader, newWidth);
    }
}

// Function to stop resizing the column
function stopResize() {
    if (currentResizingHeader) {
        document.removeEventListener('mousemove', resizeColumn);
        document.removeEventListener('mouseup', stopResize);
        currentResizingHeader = null;
    }
}
// Function to toggle wager details visibility
function toggleWagerDetails() {
    const header = document.getElementById("wagerDetailsHeader");
    const container = document.getElementById("wagerDetailsContainer");
    const isHidden = header.style.display === "none";

    header.style.display = isHidden ? "block" : "none";
    container.style.display = isHidden ? "block" : "none";

    if (isHidden) {
        loadWalletWagers();  // Load the wallet wagers when showing the details
    }
}

// Function to resize all cells in the column
function resizeColumnCells(header, width) {
    const headerIndex = Array.from(header.parentElement.children).indexOf(header);
    const table = header.closest('table');
    const columnCells = table.querySelectorAll(`tr td:nth-child(${headerIndex + 1}), tr th:nth-child(${headerIndex + 1})`);

    columnCells.forEach(cell => {
        cell.style.width = `${width}px`;
    });
}
});

// Make sure these functions are defined before they are called

const API_BASE_URL = "https://dev.wagervs.fun/api";

// Function to load campaigns
async function loadCampaigns() {
    try {
        const response = await fetch(`${API_BASE_URL}/allcampaigns`);
        if (!response.ok) throw new Error("Failed to fetch campaigns.");

        const campaigns = await response.json();
        const selector = document.getElementById("campaignSelector");
        selector.innerHTML = '<option value="">Select a Campaign</option>';

        campaigns.forEach(campaign => {
            const option = document.createElement("option");
            option.value = campaign.campaign_id;
            option.textContent = campaign.name;
            selector.appendChild(option);
        });
    } catch (error) {
        console.error("❌ Error loading campaigns:", error);
        alert("Failed to load campaigns.");
    }
}

// Function to load campaign pools
async function loadCampaignPools() {
    const campaignId = document.getElementById("campaignSelector").value;
    if (!campaignId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/campaignTotals?campaign_id=${campaignId}`);
        if (!response.ok) throw new Error("Failed to fetch pool data.");

        const data = await response.json();
        console.log("Campaign Totals Data:", data); // Log the data

        const leftTotal = Number(data.leftTotal) || 0;
        const rightTotal = Number(data.rightTotal) || 0;

        const tableBody = document.getElementById("distributionTable");

        tableBody.innerHTML = `
            <tr>
                <td>${data.leftButton}</td>
                <td>${leftTotal.toLocaleString()} $VS</td>
                <td><input type="radio" name="winner" value="${data.leftButton}" ${leftTotal > rightTotal ? 'checked' : ''} onchange="checkConditions()"></td>
                <td rowspan="2"><input type="checkbox" class="completed-checkbox" onchange="markCompleted(${campaignId}, this); checkConditions()"></td>
                <td rowspan="2" id="completionDate-${campaignId}">N/A</td>
            </tr>
            <tr>
                <td>${data.rightButton}</td>
                <td>${rightTotal.toLocaleString()} $VS</td>
                <td><input type="radio" name="winner" value="${data.rightButton}" ${rightTotal > leftTotal ? 'checked' : ''} onchange="checkConditions()"></td>
            </tr>
        `;
    } catch (error) {
        console.error("❌ Error loading distribution data:", error);
        alert("Failed to load campaign pools.");
    }
}

// Event listener for campaign selector change
document.getElementById("campaignSelector").addEventListener("change", loadCampaignPools);

// Call loadCampaigns when the document is ready
document.addEventListener("DOMContentLoaded", () => {
    loadCampaigns();
});

