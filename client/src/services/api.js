// src/services/api.js

// Mock Data Fallback (in case Backend / Port 8080 is not running)
const mockTrains = [
    // ── Delhi routes ──────────────────────────────────────────────────────────
    { id: 1,  name: 'Shatabdi Express',       number: '12001', from: 'Bhopal (BPL)',             to: 'New Delhi (NDLS)',          dep: '15:15', arr: '23:30', duration: '8h 15m',  fare: '₹1,245', seats: 45, status: 'AVAILABLE',                                 tags: ['Fastest'] },
    { id: 2,  name: 'Rajdhani Express',        number: '12951', from: 'Mumbai Central (MMCT)',    to: 'New Delhi (NDLS)',          dep: '17:00', arr: '08:32', duration: '15h 32m', fare: '₹2,850', seats: 0,  status: 'WL',  wlPos: 12, probability: 'High',     tags: ['Premium Food'] },
    { id: 3,  name: 'Vande Bharat Express',    number: '22436', from: 'Varanasi (BSB)',           to: 'New Delhi (NDLS)',          dep: '15:00', arr: '23:00', duration: '8h 00m',  fare: '₹1,750', seats: 2,  status: 'AVAILABLE',                                 tags: ['Fastest', 'New Rake'] },
    { id: 4,  name: 'August Kranti Rajdhani',  number: '12953', from: 'Mumbai Central (MMCT)',    to: 'New Delhi (NDLS)',          dep: '17:40', arr: '10:55', duration: '17h 15m', fare: '₹3,100', seats: 18, status: 'AVAILABLE',                                 tags: ['Premium Food', 'Daily'] },
    { id: 5,  name: 'Punjab Mail',             number: '12137', from: 'Firozpur (FZR)',           to: 'Mumbai CST (CSTM)',         dep: '05:15', arr: '09:15', duration: '28h 00m', fare: '₹980',   seats: 0,  status: 'WL',  wlPos: 8,  probability: 'High',     tags: ['Historic', 'Daily'] },
    { id: 6,  name: 'Garib Rath Express',      number: '12909', from: 'Bhopal (BPL)',             to: 'Mumbai Central (MMCT)',     dep: '22:10', arr: '14:30', duration: '16h 20m', fare: '₹890',   seats: 0,  status: 'RAC', racPos: 4,  probability: 'High',     tags: ['Budget'] },
    { id: 7,  name: 'Sampark Kranti Exp',      number: '12448', from: 'New Delhi (NDLS)',         to: 'Bengaluru (SBC)',           dep: '20:15', arr: '06:00', duration: '33h 45m', fare: '₹2,120', seats: 0,  status: 'RAC', racPos: 11, probability: 'Medium',   tags: ['Weekly'] },
    { id: 8,  name: 'Kalka Mail',              number: '12311', from: 'Howrah (HWH)',             to: 'Kalka (KLK)',               dep: '19:40', arr: '11:55', duration: '40h 15m', fare: '₹1,380', seats: 31, status: 'AVAILABLE',                                 tags: ['Heritage'] },
    { id: 9,  name: 'Golden Temple Mail',      number: '12903', from: 'Amritsar (ASR)',           to: 'Mumbai Central (MMCT)',     dep: '16:30', arr: '22:45', duration: '30h 15m', fare: '₹1,650', seats: 0,  status: 'WL',  wlPos: 33, probability: 'Medium',   tags: ['Daily'] },
    { id: 10, name: 'Howrah Rajdhani',         number: '12301', from: 'Howrah (HWH)',             to: 'New Delhi (NDLS)',          dep: '14:05', arr: '09:55', duration: '19h 50m', fare: '₹3,200', seats: 0,  status: 'WL',  wlPos: 5,  probability: 'High',     tags: ['Premium Food', 'Daily'] },

    // ── Mumbai routes ─────────────────────────────────────────────────────────
    { id: 11, name: 'Duronto Express',         number: '12269', from: 'Chennai (MAS)',            to: 'Nizamuddin (NZM)',          dep: '06:35', arr: '10:40', duration: '28h 05m', fare: '₹3,420', seats: 0,  status: 'WL',  wlPos: 45, probability: 'Low',      tags: ['Non-Stop'] },
    { id: 12, name: 'Deccan Queen',            number: '12123', from: 'Pune (PUNE)',              to: 'Mumbai CST (CSTM)',         dep: '07:15', arr: '10:25', duration: '3h 10m',  fare: '₹320',   seats: 72, status: 'AVAILABLE',                                 tags: ['Iconic', 'Daily'] },
    { id: 13, name: 'Tejas Express',           number: '82901', from: 'Mumbai Central (MMCT)',    to: 'Goa (KRMI)',               dep: '05:50', arr: '14:20', duration: '8h 30m',  fare: '₹1,550', seats: 0,  status: 'WL',  wlPos: 25, probability: 'Medium',   tags: ['Executive Class'] },
    { id: 14, name: 'Mumbai Rajdhani',         number: '12221', from: 'Mumbai Central (MMCT)',    to: 'Hazrat Nizamuddin (NZM)',   dep: '23:00', arr: '17:25', duration: '18h 25m', fare: '₹2,970', seats: 9,  status: 'AVAILABLE',                                 tags: ['Premium Food'] },
    { id: 15, name: 'Konkan Kanya Express',    number: '10111', from: 'Mumbai CST (CSTM)',        to: 'Karmali (KRMI)',            dep: '22:00', arr: '10:10', duration: '12h 10m', fare: '₹760',   seats: 0,  status: 'RAC', racPos: 7,  probability: 'High',     tags: ['Coastal', 'Scenic'] },

    // ── South India routes ────────────────────────────────────────────────────
    { id: 16, name: 'Chennai Rajdhani',        number: '12433', from: 'New Delhi (NDLS)',         to: 'Chennai (MAS)',             dep: '22:30', arr: '07:55', duration: '33h 25m', fare: '₹3,550', seats: 4,  status: 'AVAILABLE',                                 tags: ['Premium Food'] },
    { id: 17, name: 'Lalbagh Express',         number: '12607', from: 'Bengaluru (SBC)',          to: 'Chennai (MAS)',             dep: '06:30', arr: '11:25', duration: '4h 55m',  fare: '₹415',   seats: 88, status: 'AVAILABLE',                                 tags: ['Daily', 'Fast'] },
    { id: 18, name: 'Island Express',          number: '16331', from: 'Thiruvananthapuram (TVC)', to: 'Rameswaram (RMM)',          dep: '06:15', arr: '18:05', duration: '11h 50m', fare: '₹680',   seats: 0,  status: 'WL',  wlPos: 18, probability: 'Low',      tags: ['Scenic', 'Weekly'] },
    { id: 19, name: 'Navjeevan Express',       number: '16687', from: 'Mangaluru (MAQ)',          to: 'Jammu Tawi (JAT)',          dep: '07:50', arr: '07:30', duration: '47h 40m', fare: '₹1,820', seats: 0,  status: 'RAC', racPos: 3,  probability: 'Medium',   tags: ['Long Route'] },
    { id: 20, name: 'Bengaluru Rajdhani',      number: '22691', from: 'Bengaluru (SBC)',          to: 'New Delhi (NDLS)',          dep: '20:00', arr: '05:55', duration: '33h 55m', fare: '₹3,300', seats: 22, status: 'AVAILABLE',                                 tags: ['Premium Food', 'Daily'] },

    // ── East India & NE routes ────────────────────────────────────────────────
    { id: 21, name: 'Poorva Express',          number: '12381', from: 'Howrah (HWH)',             to: 'New Delhi (NDLS)',          dep: '16:55', arr: '16:25', duration: '23h 30m', fare: '₹1,195', seats: 55, status: 'AVAILABLE',                                 tags: ['Daily'] },
    { id: 22, name: 'Guwahati Rajdhani',       number: '12423', from: 'Dibrugarh (DBRG)',         to: 'New Delhi (NDLS)',          dep: '13:00', arr: '19:55', duration: '58h 55m', fare: '₹2,780', seats: 0,  status: 'WL',  wlPos: 22, probability: 'Medium',   tags: ['Weekly', 'Long Route'] },
    { id: 23, name: 'Coromandel Express',      number: '12841', from: 'Howrah (HWH)',             to: 'Chennai (MAS)',             dep: '14:45', arr: '15:55', duration: '25h 10m', fare: '₹1,450', seats: 0,  status: 'RAC', racPos: 9,  probability: 'High',     tags: ['Superfast', 'Daily'] },
    { id: 24, name: 'Humsafar Express',        number: '12501', from: 'Purnia (PNU)',             to: 'Bengaluru (SBC)',           dep: '18:20', arr: '07:05', duration: '36h 45m', fare: '₹2,250', seats: 14, status: 'AVAILABLE',                                 tags: ['AC 3-Tier Only', 'Weekly'] },

    // ── West & Central India routes ───────────────────────────────────────────
    { id: 25, name: 'Avantika Express',        number: '12961', from: 'Indore (INDB)',            to: 'Mumbai Central (MMCT)',     dep: '19:15', arr: '09:30', duration: '14h 15m', fare: '₹870',   seats: 37, status: 'AVAILABLE',                                 tags: ['Daily'] },
    { id: 26, name: 'Intercity Express',       number: '12157', from: 'Mumbai CST (CSTM)',        to: 'Pune (PUNE)',               dep: '06:05', arr: '09:25', duration: '3h 20m',  fare: '₹290',   seats: 120,status: 'AVAILABLE',                                 tags: ['Daily', 'Fast'] },
    { id: 27, name: 'Paschim Express',         number: '12925', from: 'Mumbai Central (MMCT)',    to: 'Amritsar (ASR)',            dep: '21:30', arr: '07:00', duration: '33h 30m', fare: '₹1,680', seats: 0,  status: 'WL',  wlPos: 14, probability: 'High',     tags: ['Daily'] },
    { id: 28, name: 'Sachkhand Express',       number: '12715', from: 'Hyderabad (HYB)',          to: 'Amritsar (ASR)',            dep: '07:30', arr: '13:45', duration: '30h 15m', fare: '₹1,530', seats: 0,  status: 'RAC', racPos: 6,  probability: 'Medium',   tags: ['Weekly'] },
    { id: 29, name: 'Nanded Express',          number: '17057', from: 'Hyderabad (HYB)',          to: 'Bengaluru (SBC)',           dep: '22:00', arr: '08:30', duration: '10h 30m', fare: '₹580',   seats: 63, status: 'AVAILABLE',                                 tags: ['Overnight', 'Daily'] },
    { id: 30, name: 'Jodhpur Rajdhani',        number: '22463', from: 'Jodhpur (JU)',             to: 'New Delhi (NDLS)',          dep: '21:00', arr: '07:30', duration: '10h 30m', fare: '₹2,450', seats: 0,  status: 'WL',  wlPos: 3,  probability: 'High',     tags: ['Non-Stop'] },
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
