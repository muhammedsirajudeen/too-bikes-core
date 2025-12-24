
async function debugVehicles() {
    const baseUrl = 'http://localhost:3001/api/v1'; // Assuming default nextjs port

    try {
        console.log('Fetching stores...');
        const storesRes = await fetch(`${baseUrl}/stores`);
        const storesData = await storesRes.json();

        if (!storesData.success) {
            console.error('Failed to fetch stores:', storesData);
            return;
        }

        const stores = storesData.data;
        console.log(`Found ${stores.length} stores.`);

        // Mock parameters matching the client's default query
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(tomorrow.getDate() + 1);

        const params = new URLSearchParams({
            startTime: tomorrow.toISOString(),
            endTime: dayAfter.toISOString(),
            page: '1',
            limit: '10'
        });

        for (const store of stores) {
            console.log(`\nChecking store: ${store.name} (${store._id})`);
            
            // Clone params and add storeId
            const storeParams = new URLSearchParams(params);
            storeParams.append('storeId', store._id);

            const url = `${baseUrl}/available-vehicles?${storeParams.toString()}`;
            console.log(`Fetching: ${url}`);
            
            const vehiclesRes = await fetch(url);
            
            // Check content type to avoid crashing on HTML error pages
            const contentType = vehiclesRes.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                 console.error(`Error: Non-JSON response from ${url} (Status: ${vehiclesRes.status})`);
                 const text = await vehiclesRes.text();
                 console.error(`Response snippet: ${text.substring(0, 100)}...`);
                 continue;
            }

            const vehiclesData = await vehiclesRes.json();

            if (!vehiclesData.success) {
                console.error('Failed to fetch vehicles:', vehiclesData);
                continue;
            }

            const vehicles = vehiclesData.data;
            console.log(`Available Vehicles: ${vehicles.length}`);
            vehicles.forEach((v) => {
                console.log(` - ${v.name} (Active: ${v.isActive}, Brand: ${v.brand})`);
            });
        }

    } catch (error) {
        console.error('Debug script error:', error);
    }
}

debugVehicles();
