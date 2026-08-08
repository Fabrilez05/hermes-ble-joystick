const base = document.getElementById('joystick_Base');
const stick = document.getElementById('joystick_Stick');
const xVal = document.getElementById('x-val');
const yVal = document.getElementById('y-val');

let isDragging = false;
const maxDistance = 75;

function getCenter() {
    const rect = base.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function resetStick() {
    isDragging = false;
    stick.style.transform = 'translate(-50%, -50%)';
    xVal.innerText = '0.00';
    yVal.innerText = '0.00';
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