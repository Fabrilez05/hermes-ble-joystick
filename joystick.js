const base = document.getElementById('joystick_Base');
const stick = document.getElementById('joystick_Stick');
const xVal = document.getElementById('x-val');
const yVal = document.getElementById('y-val');
const connectBleBtn = document.getElementById('connect-ble-btn');

let isDragging = false;
let bleCharacteristic = null;
const maxDistance = 75;
const serviceUUID = 'd3f8007e-c032-43ef-90f7-b042e9910fff';
const characteristicUUID = 'f85ba695-b4ec-42cf-8127-1c08d2fbce99';

function getCenter() {
    const rect = base.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function sendBleCommand(x, y) {
    if (!bleCharacteristic) return;

    const commandString = `X:${x},Y:${y}`;
    const data = new TextEncoder().encode(commandString);

    bleCharacteristic.writeValueWithoutResponse(data).catch(err => {
        console.error('BLE write error:', err);
    });
}

function resetStick() {
    isDragging = false;
    stick.style.transform = 'translate(-50%, -50%)';
    xVal.innerText = '0.00';
    yVal.innerText = '0.00';
    sendBleCommand('0.00', '0.00');
}

function moveStick(event) {
    if (!isDragging) return;

    const center = getCenter();
    const x = event.clientX - center.x;
    const y = event.clientY - center.y;

    const distance = Math.sqrt(x * x + y * y);
    const currentDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(y, x);

    const moveX = currentDistance * Math.cos(angle);
    const moveY = currentDistance * Math.sin(angle);

    stick.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;

    const normalizedX = (moveX / maxDistance).toFixed(2);
    const normalizedY = (-moveY / maxDistance).toFixed(2);

    xVal.innerText = normalizedX;
    yVal.innerText = normalizedY;

    sendBleCommand(normalizedX, normalizedY);
}

function startDrag(event) {
    event.preventDefault();
    isDragging = true;
    stick.setPointerCapture?.(event.pointerId);
}

stick.addEventListener('pointerdown', startDrag);
base.addEventListener('pointerdown', startDrag);

document.addEventListener('pointermove', moveStick);
document.addEventListener('pointerup', resetStick);
document.addEventListener('pointercancel', resetStick);

async function connectBLE() {
    if (!navigator.bluetooth) {
        console.error('Holy moly!');
        return;
    }

    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [serviceUUID] }],
            optionalServices: [serviceUUID]
        });

        device.addEventListener('gattserverdisconnected', () => {
            bleCharacteristic = null;
            if (connectBleBtn) {
                connectBleBtn.disabled = false;
                connectBleBtn.textContent = 'Connect BLE';
            }
            console.log('BLE disconnected');
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(serviceUUID);
        bleCharacteristic = await service.getCharacteristic(characteristicUUID);

        if (connectBleBtn) {
            connectBleBtn.disabled = true;
            connectBleBtn.textContent = 'BLE connected';
        }

        console.log('Someone who is not afraid to... send a message');
    } catch (error) {
        console.error('All you have to do is not open this bag! ', error);
    }
}

if (connectBleBtn) {
    connectBleBtn.addEventListener('click', connectBLE);
}