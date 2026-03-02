// src/services/api.js

// Mock Data Fallback (in case Backend / Port 8080 is not running)
const mockTrains = [
    { id: 1, name: 'Shatabdi Express', number: '12001', from: 'Bhopal (BPL)', to: 'New Delhi (NDLS)', dep: '15:15', arr: '23:30', duration: '8h 15m', fare: '₹1,245', seats: 45, status: 'AVAILABLE', tags: ['Fastest'] },
    { id: 2, name: 'Rajdhani Express', number: '12951', from: 'Mumbai (MMCT)', to: 'New Delhi (NDLS)', dep: '17:00', arr: '08:32', duration: '15h 32m', fare: '₹2,850', seats: 0, status: 'WL', wlPos: 12, probability: 'High', tags: ['Premium Food'] },
    { id: 3, name: 'Vande Bharat Exp', number: '22436', from: 'Varanasi (BSB)', to: 'New Delhi (NDLS)', dep: '15:00', arr: '23:00', duration: '8h 00m', fare: '₹1,750', seats: 2, status: 'AVAILABLE', tags: ['Fastest', 'New Rake'] },
    { id: 4, name: 'Duronto Express', number: '12269', from: 'Chennai (MAS)', to: 'Nizamuddin (NZM)', dep: '06:35', arr: '10:40', duration: '28h 05m', fare: '₹3,420', seats: 0, status: 'WL', wlPos: 45, probability: 'Low', tags: ['Non-Stop'] },
    { id: 5, name: 'Tejas Express', number: '82901', from: 'Mumbai Central (MMCT)', to: 'Karmali (KRMI)', dep: '05:50', arr: '14:20', duration: '8h 30m', fare: '₹1,550', seats: 0, status: 'WL', wlPos: 25, probability: 'Medium', tags: ['Executive Class'] }
];

const BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Perform a GET request to /api/v1/trains/search
 */
export const searchTrains = async (fromQuery, toQuery, date) => {
    try {
        const queryDate = date || new Date().toISOString().split('T')[0];
        const response = await fetch(`${BASE_URL}/trains/search?from=${encodeURIComponent(fromQuery)}&to=${encodeURIComponent(toQuery)}&date=${queryDate}`);
        if (!response.ok) throw new Error(`API returned status: ${response.status}`);
        const data = await response.json();
        return { data, status: response.status };
    } catch (err) {
        console.warn("Backend unreachable. Falling back to Mock API Data:", err);
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = mockTrains.filter(t =>
                    (fromQuery === '' || t.from.toLowerCase().includes(fromQuery.toLowerCase())) &&
                    (toQuery === '' || t.to.toLowerCase().includes(toQuery.toLowerCase()))
                );
                resolve({ data: results, status: 200 });
            }, 800);
        });
    }
};

/**
 * Perform a POST request to /api/v1/bookings
 */
export const bookTicket = async (bookingData) => {
    try {
        const response = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: bookingData.userId || 1,
                scheduleId: bookingData.scheduleId,
                seatNumber: bookingData.seatNumber,
                berthPreference: bookingData.berthPreference
            })
        });
        if (!response.ok) throw new Error(`API returned status: ${response.status}`);
        const data = await response.json();
        return { data, status: response.status };
    } catch (err) {
        console.warn("Backend unreachable. Falling back to Mock API Payment Pipeline:", err);
        return new Promise((resolve) => {
            setTimeout(() => {
                const pnr = `8492${Math.floor(100000 + Math.random() * 900000)}`;
                resolve({
                    data: {
                        pnr,
                        status: 'CONFIRMED',
                        seatNumber: bookingData.seatNumber,
                        berthPreference: bookingData.berthPreference,
                        trainName: bookingData.trainName,
                        trainNumber: bookingData.trainNumber,
                        message: 'Booking Successful (Mocked Data)'
                    },
                    status: 200
                });
            }, 1200);
        });
    }
};

/**
 * Perform a GET request to mock PNR status data
 */
export const checkPNRStatus = async (pnr) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (pnr.length !== 10) {
                reject({ message: "Invalid PNR format", status: 400 });
                return;
            }

            // Fake logic: if PNR ends in 9, it's waitlisted. Otherwise confirmed.
            const isWaitlisted = pnr.endsWith('9');

            // Randomize train for PNR
            const trainIndex = Math.floor(Math.random() * mockTrains.length);
            const train = mockTrains[trainIndex];

            const responseStatus = isWaitlisted ? 'WAITLISTED' : 'CHART PREPARED';
            const passengerStatus = isWaitlisted ? `WL ${Math.floor(Math.random() * 20) + 1}` : `CNF / B${Math.floor(Math.random() * 8) + 1} / ${Math.floor(Math.random() * 72) + 1} / ${['SU', 'SL', 'LB', 'MB', 'UB'][Math.floor(Math.random() * 5)]}`;

            resolve({
                data: {
                    pnr: pnr,
                    trainName: train.name,
                    trainNumber: train.number,
                    source: train.from,
                    destination: train.to,
                    departureTime: train.dep,
                    arrivalTime: train.arr,
                    date: new Date().toISOString().split('T')[0],
                    pasengers: 1,
                    status: responseStatus,
                    passengerStatus: passengerStatus,
                    bookingClass: '3A'
                },
                status: 200
            });
        }, 1500);
    });
};

/**
 * Perform a POST request to login a user (Mock)
 */
export const loginUser = async (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!email || !password) {
                reject({ message: "Please provide both email and password.", status: 400 });
                return;
            }
            if (password.length < 6) {
                reject({ message: "Invalid credentials. Please try again.", status: 401 });
                return;
            }
            // Mock success
            resolve({
                data: {
                    token: "mock_jwt_token_12345",
                    user: {
                        id: 1,
                        name: email.split('@')[0],
                        email: email
                    }
                },
                status: 200
            });
        }, 1000);
    });
};

/**
 * Perform a POST request to register a user (Mock)
 */
export const registerUser = async (name, email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!name || !email || !password) {
                reject({ message: "All fields are required.", status: 400 });
                return;
            }
            // Mock success
            resolve({
                data: {
                    token: "mock_jwt_token_12345",
                    user: {
                        id: 1,
                        name: name,
                        email: email
                    }
                },
                status: 201
            });
        }, 1200);
    });
};

/**
 * Perform a GET request to mock live train data based on a train number
 */
export const getLiveTrainStatus = async (trainNumber) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const train = mockTrains.find(t => t.number === trainNumber);
            if (!train) {
                reject({ message: "Train not found", status: 404 });
                return;
            }

            const currentHour = new Date().getHours();

            let stationList = [];
            // Map accurate intermediate halts based on train number
            if (train.number === '12001') {
                stationList = [
                    { name: 'Jhansi Jn (JHS)', time: '16:45', status: 'Departed', actualTime: '16:45', platform: '4', halt: '8m' },
                    { name: 'Gwalior (GWL)', time: '18:02', status: 'Departed', actualTime: '18:15', platform: '2', halt: '2m' },
                    { name: 'Agra Cantt (AGC)', time: '19:50', status: 'Expected', actualTime: '20:00', platform: '3', halt: '5m' },
                    { name: 'Mathura Jn (MTJ)', time: '20:45', status: 'Expected', actualTime: '21:05', platform: '1', halt: '3m' }
                ];
            } else if (train.number === '12951') {
                stationList = [
                    { name: 'Surat (ST)', time: '19:43', status: 'Departed', actualTime: '19:48', platform: '1', halt: '5m' },
                    { name: 'Vadodara Jn (BRC)', time: '21:06', status: 'Departed', actualTime: '21:14', platform: '2', halt: '8m' },
                    { name: 'Ratlam Jn (RTM)', time: '00:15', status: 'Expected', actualTime: '00:20', platform: '4', halt: '5m' },
                    { name: 'Kota Jn (KOTA)', time: '03:15', status: 'Expected', actualTime: '03:30', platform: '1', halt: '10m' }
                ];
            } else if (train.number === '22436') {
                stationList = [
                    { name: 'Prayagraj Jn (PRYJ)', time: '16:30', status: 'Departed', actualTime: '16:35', platform: '6', halt: '5m' },
                    { name: 'Kanpur Central (CNB)', time: '18:45', status: 'Departed', actualTime: '19:00', platform: '2', halt: '5m' }
                ];
            } else if (train.number === '12269') {
                stationList = [
                    { name: 'Vijayawada Jn (BZA)', time: '12:10', status: 'Departed', actualTime: '12:20', platform: '7', halt: '10m' },
                    { name: 'Balharshah (BPQ)', time: '18:00', status: 'Departed', actualTime: '18:10', platform: '4', halt: '10m' },
                    { name: 'Nagpur (NGP)', time: '20:35', status: 'Expected', actualTime: '20:50', platform: '3', halt: '15m' },
                    { name: 'Bhopal Jn (BPL)', time: '02:00', status: 'Expected', actualTime: '02:30', platform: '2', halt: '10m' },
                    { name: 'Jhansi Jn (JHS)', time: '05:40', status: 'Expected', actualTime: '06:00', platform: '4', halt: '8m' }
                ];
            } else if (train.number === '82901') {
                stationList = [
                    { name: 'Borivali (BVI)', time: '06:25', status: 'Departed', actualTime: '06:27', platform: '6', halt: '2m' },
                    { name: 'Panvel (PNVL)', time: '07:45', status: 'Departed', actualTime: '07:50', platform: '7', halt: '5m' },
                    { name: 'Ratnagiri (RN)', time: '11:15', status: 'Expected', actualTime: '11:25', platform: '1', halt: '5m' },
                    { name: 'Kudal (KUDL)', time: '13:00', status: 'Expected', actualTime: '13:10', platform: '2', halt: '2m' }
                ];
            } else {
                stationList = [
                    { name: 'Intermediate Station 1', time: '18:00', status: 'Departed', actualTime: '18:15', platform: '2', halt: '5m' },
                    { name: 'Intermediate Station 2', time: '20:30', status: 'Expected', actualTime: '20:45', platform: '1', halt: '2m' }
                ];
            }

            const delayMinutes = Math.floor(Math.random() * 45);
            let aiInsight = '';
            if (delayMinutes === 0) {
                aiInsight = 'Train is maintaining excellent speed. High probability of reaching destination early or on-time.';
            } else if (delayMinutes <= 15) {
                aiInsight = 'Minor delay detected. RailMax AI predicts train will easily recover time before next major junction halt.';
            } else {
                aiInsight = 'Heavy congestion on route segment ahead. Expect slower speeds for next 45KM. Last minute platform changes are possible.';
            }

            resolve({
                data: {
                    trainName: train.name,
                    trainNumber: train.number,
                    source: train.from,
                    destination: train.to,
                    status: 'RUNNING',
                    delayMinutes: delayMinutes,
                    lastUpdated: new Date().toLocaleTimeString(),
                    aiInsight: aiInsight,
                    currentStation: 'En route to ' + (stationList[2]?.name?.split(' (')[0] || train.to.split(' (')[0]),
                    stations: [
                        { name: train.from, time: train.dep, status: 'Departed', actualTime: train.dep, platform: 'Starts', halt: '-' },
                        ...stationList,
                        { name: train.to, time: train.arr, status: 'Expected', actualTime: 'TBD', platform: 'Term.,', halt: '-' }
                    ]
                },
                status: 200
            });
        }, 1200);
    });
};
