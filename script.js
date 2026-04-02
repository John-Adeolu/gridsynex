// Data storage
let surveyData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    propertyType: '',
    bedrooms: '',
    floorArea: '',
    heatingSystem: '',
    epcRating: '',
    selectedOptions: []
};

const savedSurveys = {
    '12 King Street, Bristol': {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '020 1234 5678',
        address: '12 King Street',
        postcode: 'BS1 4EF',
        propertyType: 'semi-detached',
        bedrooms: '3',
        floorArea: '140',
        heatingSystem: 'gas-boiler',
        epcRating: 'D',
        selectedOptions: ['solar-pv', 'heat-pump']
    },
    '84 Meadow Park Road, Leeds': {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '0113 123 4567',
        address: '84 Meadow Park Road',
        postcode: 'LS10 1QA',
        propertyType: 'detached',
        bedrooms: '4',
        floorArea: '180',
        heatingSystem: 'gas-boiler',
        epcRating: 'E',
        selectedOptions: ['solar-pv', 'battery', 'heat-pump']
    },
    '27 Station Road, Croydon': {
        name: 'Michael Brown',
        email: 'michael@example.com',
        phone: '020 8123 4567',
        address: '27 Station Road',
        postcode: 'CR0 2SG',
        propertyType: 'terraced',
        bedrooms: '2',
        floorArea: '90',
        heatingSystem: 'gas-boiler',
        epcRating: 'F',
        selectedOptions: ['solar-pv', 'smart-home']
    }
};

let map = null;
let marker = null;

// UK coordinates
const ukBounds = [
    [49.5, -8],
    [56, 2]
];

const addressCoordinates = {
    'BS1 4EF': { lat: 51.4545, lng: -2.5973, name: '12 King Street, Bristol' },
    'LS10 1QA': { lat: 53.8087, lng: -1.5395, name: '84 Meadow Park Road, Leeds' },
    'CR0 2SG': { lat: 51.3717, lng: -0.1050, name: '27 Station Road, Croydon' }
};

function initMap() {
    if (map) return;
    
    map = L.map('map').setView([52.5, -2], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 5
    }).addTo(map);
}

function setMapMarker(lat, lng, name) {
    if (map) {
        if (marker) {
            map.removeLayer(marker);
        }
        
        marker = L.circleMarker([lat, lng], {
            radius: 10,
            fillColor: '#22c55e',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(map);

        map.setView([lat, lng], 13);
    }
}

function handleAddressInput(value) {
    // Can be used for real-time suggestions
}

function searchAddress() {
    const searchInput = document.getElementById('mapSearch').value.trim().toUpperCase();
    
    if (!searchInput) return;

    // Try to match postcode
    for (const [postcode, coords] of Object.entries(addressCoordinates)) {
        if (postcode.includes(searchInput) || searchInput.includes(postcode)) {
            setMapMarker(coords.lat, coords.lng, coords.name);
            return;
        }
    }

    // Try UK postcode format - basic geocoding simulation
    // In production, you'd use a real geocoding API
    if (/^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i.test(searchInput)) {
        // Default to UK center for unknown postcodes
        map.setView([52.5, -2], 10);
    }
}

function updateData(field, value) {
    surveyData[field] = value;
}

function getSelectedOptions() {
    const options = [];
    if (document.getElementById('solar-pv').checked) options.push('solar-pv');
    if (document.getElementById('battery').checked) options.push('battery');
    if (document.getElementById('heat-pump').checked) options.push('heat-pump');
    if (document.getElementById('smart-home').checked) options.push('smart-home');
    return options;
}

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    document.querySelector('.content').scrollTop = 0;

    if (screenId === 'screen-map') {
        setTimeout(() => {
            initMap();
            
            // Load address from details screen if available
            const addressInput = document.getElementById('address').value;
            const postcodeInput = document.getElementById('postcode').value;
            
            if (postcodeInput) {
                document.getElementById('mapSearch').value = postcodeInput;
                searchAddress();
            } else if (addressInput) {
                document.getElementById('mapSearch').value = addressInput;
            } else {
                // Default to UK view
                map.setView([52.5, -2], 6);
            }
        }, 100);
    }
}

function loadSurvey(address) {
    const survey = savedSurveys[address];
    if (survey) {
        surveyData = JSON.parse(JSON.stringify(survey));
    }
}

function calculateSolarPV(floorArea, epcRating) {
    const suitability = {
        'A': '⭐⭐⭐⭐⭐ Excellent',
        'B': '⭐⭐⭐⭐⭐ Excellent',
        'C': '⭐⭐⭐⭐ Very Good',
        'D': '⭐⭐⭐⭐ Very Good',
        'E': '⭐⭐⭐ Good',
        'F': '⭐⭐⭐ Good',
        'G': '⭐⭐ Fair'
    };

    const area = parseFloat(floorArea) || 100;
    const systemSize = Math.max(3, Math.ceil(area / 40));
    const annualGeneration = systemSize * 800;
    const savingsPerYear = annualGeneration * 0.25;
    const costEstimate = systemSize * 2500;

    return {
        size: `${systemSize} kW`,
        generation: `${annualGeneration.toLocaleString()} kWh/year`,
        savings: `£${savingsPerYear.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        cost: `£${costEstimate.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        payback: `${(costEstimate / savingsPerYear).toFixed(1)} years`,
        suitability: suitability[epcRating] || '⭐⭐⭐ Good',
        carbonReduction: `${(annualGeneration * 0.19).toFixed(0)} kg CO₂`
    };
}

function calculateBattery(floorArea) {
    const area = parseFloat(floorArea) || 100;
    const batterySize = Math.max(5, Math.ceil(area / 30));
    const savingsPerYear = batterySize * 150;
    const costEstimate = batterySize * 850;

    return {
        size: `${batterySize} kWh`,
        savings: `£${savingsPerYear.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        cost: `£${costEstimate.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        payback: `${(costEstimate / savingsPerYear).toFixed(1)} years`,
        carbonReduction: `${(batterySize * 120).toFixed(0)} kg CO₂`
    };
}

function calculateHeatPump(propertyType, heatingSystem, floorArea, bedrooms) {
    const suitability = {
        'detached': '⭐⭐⭐⭐⭐ Excellent',
        'semi-detached': '⭐⭐⭐⭐ Very Good',
        'terraced': '⭐⭐⭐⭐ Very Good',
        'bungalow': '⭐⭐⭐⭐⭐ Excellent',
        'flat': '⭐⭐⭐ Good'
    };

    const area = parseFloat(floorArea) || 100;
    const systemSize = Math.max(6, Math.ceil(area / 25));
    const savingsPerYear = area * 8;
    const costEstimate = systemSize * 3500;

    return {
        size: `${systemSize} kW`,
        suitability: suitability[propertyType] || '⭐⭐⭐ Good',
        savings: `£${savingsPerYear.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        cost: `£${costEstimate.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        payback: `${(costEstimate / savingsPerYear).toFixed(1)} years`,
        carbonReduction: `${(area * 1.2).toFixed(0)} kg CO₂`
    };
}

function calculateSmartHome(floorArea) {
    const area = parseFloat(floorArea) || 100;
    const savingsPerYear = area * 1.5;
    const costEstimate = Math.max(800, area * 5);
    const devices = [];

    if (area > 100) devices.push('Smart thermostat');
    devices.push('Smart plugs (8)');
    devices.push('Energy monitoring system');
    if (area > 120) devices.push('Smart heating controls');

    return {
        devices: devices.join(', '),
        savings: `£${savingsPerYear.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        cost: `£${costEstimate.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`,
        payback: `${(costEstimate / savingsPerYear).toFixed(1)} years`,
        carbonReduction: `${(area * 0.15).toFixed(0)} kg CO₂`
    };
}

function generateProposal() {
    const content = document.getElementById('proposal-content');
    const assumptionsContent = document.getElementById('assumptions-content');
    
    let html = '';
    let totalSavings = 0;
    let totalCost = 0;
    let totalCarbonReduction = 0;

    // Property Summary
    if (surveyData.address || surveyData.name) {
        html += '<div class="proposal-card">';
        html += '<h3>Property Summary</h3>';
        if (surveyData.name) html += `<p><strong>Owner:</strong> ${surveyData.name}</p>`;
        if (surveyData.address) html += `<p><strong>Address:</strong> ${surveyData.address}</p>`;
        if (surveyData.postcode) html += `<p><strong>Postcode:</strong> ${surveyData.postcode}</p>`;
        if (surveyData.propertyType) html += `<p><strong>Type:</strong> ${surveyData.propertyType.replace('-', ' ')}</p>`;
        if (surveyData.bedrooms) html += `<p><strong>Bedrooms:</strong> ${surveyData.bedrooms}</p>`;
        if (surveyData.floorArea) html += `<p><strong>Floor Area:</strong> ${surveyData.floorArea} m²</p>`;
        if (surveyData.heatingSystem) html += `<p><strong>Heating:</strong> ${surveyData.heatingSystem.replace('-', ' ')}</p>`;
        if (surveyData.epcRating) html += `<p><strong>EPC Rating:</strong> <span class="highlight">${surveyData.epcRating}</span></p>`;
        html += '</div>';
    }

    // Property Image
    html += '<div class="property-image-placeholder" style="margin: 16px 0;">🏠 Property Image</div>';

    // Results
    if (surveyData.selectedOptions.length > 0) {
        html += '<div style="margin-top: 20px;"><h3 style="color: #22c55e; margin-bottom: 12px; font-size: 18px; font-weight: 600;">Recommended Retrofit Measures</h3>';

        // Solar PV
        if (surveyData.selectedOptions.includes('solar-pv')) {
            const solar = calculateSolarPV(surveyData.floorArea, surveyData.epcRating);
            html += '<div class="proposal-card">';
            html += '<h3>☀️ Solar PV System</h3>';
            html += `<p><strong>Suitability:</strong> ${solar.suitability}</p>`;
            html += `<p><strong>System Size:</strong> <span class="highlight">${solar.size}</span></p>`;
            html += `<p><strong>Annual Generation:</strong> <span class="highlight">${solar.generation}</span></p>`;
            html += `<p><strong>Annual Savings:</strong> <span class="highlight">${solar.savings}</span></p>`;
            html += `<p><strong>Estimated Cost:</strong> <span class="highlight">${solar.cost}</span></p>`;
            html += `<p><strong>Payback Period:</strong> <span class="highlight">${solar.payback}</span></p>`;
            html += '</div>';
            totalSavings += parseFloat(solar.savings.replace(/[^0-9.-]/g, ''));
            totalCost += parseFloat(solar.cost.replace(/[^0-9.-]/g, ''));
            totalCarbonReduction += parseFloat(solar.carbonReduction.replace(/[^0-9.-]/g, ''));
        }

        // Battery
        if (surveyData.selectedOptions.includes('battery')) {
            const battery = calculateBattery(surveyData.floorArea);
            html += '<div class="proposal-card">';
            html += '<h3>🔋 Battery Storage</h3>';
            html += `<p><strong>Battery Size:</strong> <span class="highlight">${battery.size}</span></p>`;
            html += `<p><strong>Annual Savings:</strong> <span class="highlight">${battery.savings}</span></p>`;
            html += `<p><strong>Estimated Cost:</strong> <span class="highlight">${battery.cost}</span></p>`;
            html += `<p><strong>Payback Period:</strong> <span class="highlight">${battery.payback}</span></p>`;
            html += '</div>';
            totalSavings += parseFloat(battery.savings.replace(/[^0-9.-]/g, ''));
            totalCost += parseFloat(battery.cost.replace(/[^0-9.-]/g, ''));
            totalCarbonReduction += parseFloat(battery.carbonReduction.replace(/[^0-9.-]/g, ''));
        }

        // Heat Pump
        if (surveyData.selectedOptions.includes('heat-pump')) {
            const heatPump = calculateHeatPump(surveyData.propertyType, surveyData.heatingSystem, surveyData.floorArea, surveyData.bedrooms);
            html += '<div class="proposal-card">';
            html += '<h3>🌡️ Air Source Heat Pump</h3>';
            html += `<p><strong>Suitability:</strong> ${heatPump.suitability}</p>`;
            html += `<p><strong>System Size:</strong> <span class="highlight">${heatPump.size}</span></p>`;
            html += `<p><strong>Annual Savings:</strong> <span class="highlight">${heatPump.savings}</span></p>`;
            html += `<p><strong>Estimated Cost:</strong> <span class="highlight">${heatPump.cost}</span></p>`;
            html += `<p><strong>Payback Period:</strong> <span class="highlight">${heatPump.payback}</span></p>`;
            html += '</div>';
            totalSavings += parseFloat(heatPump.savings.replace(/[^0-9.-]/g, ''));
            totalCost += parseFloat(heatPump.cost.replace(/[^0-9.-]/g, ''));
            totalCarbonReduction += parseFloat(heatPump.carbonReduction.replace(/[^0-9.-]/g, ''));
        }

        // Smart Home
        if (surveyData.selectedOptions.includes('smart-home')) {
            const smart = calculateSmartHome(surveyData.floorArea);
            html += '<div class="proposal-card">';
            html += '<h3>🏠 Smart Home System</h3>';
            html += `<p><strong>Devices:</strong> <span class="highlight">${smart.devices}</span></p>`;
            html += `<p><strong>Annual Savings:</strong> <span class="highlight">${smart.savings}</span></p>`;
            html += `<p><strong>Estimated Cost:</strong> <span class="highlight">${smart.cost}</span></p>`;
            html += `<p><strong>Payback Period:</strong> <span class="highlight">${smart.payback}</span></p>`;
            html += '</div>';
            totalSavings += parseFloat(smart.savings.replace(/[^0-9.-]/g, ''));
            totalCost += parseFloat(smart.cost.replace(/[^0-9.-]/g, ''));
            totalCarbonReduction += parseFloat(smart.carbonReduction.replace(/[^0-9.-]/g, ''));
        }

        html += '</div>';
    }

    // Summary
    if (totalSavings > 0) {
        html += '<div style="margin-top: 20px;"><h3 style="color: #94e4c9; margin-bottom: 12px; font-size: 16px; font-weight: 600;">Investment Summary</h3>';
        html += `<div class="summary-item"><div class="summary-item-label">Total Investment:</div><div class="summary-item-value">£${totalCost.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div></div>`;
        html += `<div class="summary-item"><div class="summary-item-label">Annual Savings:</div><div class="summary-item-value">£${totalSavings.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</div></div>`;
        html += `<div class="summary-item"><div class="summary-item-label">Payback Period:</div><div class="summary-item-value">${(totalCost / totalSavings).toFixed(1)} years</div></div>`;
        html += `<div class="summary-item"><div class="summary-item-label">Annual CO₂ Reduction:</div><div class="summary-item-value">${totalCarbonReduction.toLocaleString('en-GB', { maximumFractionDigits: 0 })} kg</div></div>`;
        html += '</div>';
    }

    // Next Steps
    html += '<div class="proposal-card" style="margin-top: 20px;"><h3>Next Steps</h3><ul style="list-style: none; padding: 0;"><li style="padding: 6px 0;">1. Review the recommendations above</li><li style="padding: 6px 0;">2. Request detailed quotes from certified installers</li><li style="padding: 6px 0;">3. Check available grants and funding schemes</li><li style="padding: 6px 0;">4. Schedule site surveys with installers</li><li style="padding: 6px 0;">5. Plan installation timeline and budget</li></ul></div>';

    // Assumptions
    let assumptionsHtml = '<div class="assumptions">';
    if (!surveyData.floorArea) {
        assumptionsHtml += '<li>Floor area estimated based on property type and bedrooms</li>';
    }
    if (!surveyData.heatingSystem) {
        assumptionsHtml += '<li>Standard gas boiler heating assumed</li>';
    }
    if (!surveyData.epcRating) {
        assumptionsHtml += '<li>Average EPC rating (D) used for suitability assessment</li>';
    }

    assumptionsHtml += '<li>Costs based on 2024 market averages for South East UK</li>';
    assumptionsHtml += '<li>Savings based on typical usage patterns</li>';
    assumptionsHtml += '<li>Installation quality and maintenance assumed to be professional standard</li>';
    assumptionsHtml += '<li>Grid electricity price: 25p/kWh (typical domestic rate)</li>';
    assumptionsHtml += '</div>';

    content.innerHTML = html;
    assumptionsContent.innerHTML = assumptionsHtml;
}

function exportProposal() {
    generateProposal();
    
    let content = 'GRIDSYNEX RETROFIT PROPOSAL\n';
    content += '==========================\n\n';

    if (surveyData.name) content += `Owner: ${surveyData.name}\n`;
    if (surveyData.email) content += `Email: ${surveyData.email}\n`;
    if (surveyData.phone) content += `Phone: ${surveyData.phone}\n`;
    if (surveyData.address) content += `Address: ${surveyData.address}\n`;
    if (surveyData.postcode) content += `Postcode: ${surveyData.postcode}\n`;
    content += `\nProperty Details:\n`;
    if (surveyData.propertyType) content += `- Type: ${surveyData.propertyType}\n`;
    if (surveyData.bedrooms) content += `- Bedrooms: ${surveyData.bedrooms}\n`;
    if (surveyData.floorArea) content += `- Floor Area: ${surveyData.floorArea} m²\n`;
    if (surveyData.heatingSystem) content += `- Heating System: ${surveyData.heatingSystem}\n`;
    if (surveyData.epcRating) content += `- EPC Rating: ${surveyData.epcRating}\n`;

    content += `\n\nRECOMMENDED MEASURES:\n`;
    content += `=====================\n`;

    let totalSavings = 0;
    let totalCost = 0;
    let totalCO2 = 0;

    if (surveyData.selectedOptions.includes('solar-pv')) {
        const solar = calculateSolarPV(surveyData.floorArea, surveyData.epcRating);
        content += `\nSOLAR PV SYSTEM\n`;
        content += `- System Size: ${solar.size}\n`;
        content += `- Annual Generation: ${solar.generation}\n`;
        content += `- Annual Savings: ${solar.savings}\n`;
        content += `- Estimated Cost: ${solar.cost}\n`;
        content += `- Payback Period: ${solar.payback}\n`;
        totalSavings += parseFloat(solar.savings.replace(/[^0-9.-]/g, ''));
        totalCost += parseFloat(solar.cost.replace(/[^0-9.-]/g, ''));
    }

    if (surveyData.selectedOptions.includes('battery')) {
        const battery = calculateBattery(surveyData.floorArea);
        content += `\nBATTERY STORAGE\n`;
        content += `- Battery Size: ${battery.size}\n`;
        content += `- Annual Savings: ${battery.savings}\n`;
        content += `- Estimated Cost: ${battery.cost}\n`;
        content += `- Payback Period: ${battery.payback}\n`;
        totalSavings += parseFloat(battery.savings.replace(/[^0-9.-]/g, ''));
        totalCost += parseFloat(battery.cost.replace(/[^0-9.-]/g, ''));
    }

    if (surveyData.selectedOptions.includes('heat-pump')) {
        const hp = calculateHeatPump(surveyData.propertyType, surveyData.heatingSystem, surveyData.floorArea, surveyData.bedrooms);
        content += `\nAIR SOURCE HEAT PUMP\n`;
        content += `- System Size: ${hp.size}\n`;
        content += `- Annual Savings: ${hp.savings}\n`;
        content += `- Estimated Cost: ${hp.cost}\n`;
        content += `- Payback Period: ${hp.payback}\n`;
        totalSavings += parseFloat(hp.savings.replace(/[^0-9.-]/g, ''));
        totalCost += parseFloat(hp.cost.replace(/[^0-9.-]/g, ''));
    }

    if (surveyData.selectedOptions.includes('smart-home')) {
        const smart = calculateSmartHome(surveyData.floorArea);
        content += `\nSMART HOME SYSTEM\n`;
        content += `- Devices: ${smart.devices}\n`;
        content += `- Annual Savings: ${smart.savings}\n`;
        content += `- Estimated Cost: ${smart.cost}\n`;
        content += `- Payback Period: ${smart.payback}\n`;
        totalSavings += parseFloat(smart.savings.replace(/[^0-9.-]/g, ''));
        totalCost += parseFloat(smart.cost.replace(/[^0-9.-]/g, ''));
    }

    content += `\n\nINVESTMENT SUMMARY\n`;
    content += `==================\n`;
    content += `Total Investment: £${totalCost.toLocaleString('en-GB', { maximumFractionDigits: 0 })}\n`;
    content += `Annual Savings: £${totalSavings.toLocaleString('en-GB', { maximumFractionDigits: 0 })}\n`;
    content += `Payback Period: ${(totalCost / totalSavings).toFixed(1)} years\n`;

    content += `\n\nNEXT STEPS\n`;
    content += `==========\n`;
    content += `1. Review the recommendations above\n`;
    content += `2. Request detailed quotes from certified installers\n`;
    content += `3. Check available grants and funding schemes\n`;
    content += `4. Schedule site surveys with installers\n`;
    content += `5. Plan installation timeline and budget\n`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'GridSynex_Proposal.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

document.addEventListener('click', function(e) {
    if (document.getElementById('screen-proposal').classList.contains('active')) {
        generateProposal();
    }
});