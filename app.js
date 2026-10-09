
// CarePoint Hospital Appointment Booking System
// Frontend only: HTML, CSS, JavaScript and Bootstrap.

const STORAGE_KEY = 'carepointBookings';

const doctors = [
  {
    name: "Dr. Amara Okafor",
    department: "Cardiology",
    specialty: "Cardiologist",
    experience: "12 years' experience",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
  },
  {
    name: "Dr. Tunde Adeyemi",
    department: "General Medicine",
    specialty: "General Physician",
    experience: "10 years' experience",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop"
  },
  {
    name: "Dr. Zainab Bello",
    department: "Pediatrics",
    specialty: "Pediatrician",
    experience: "9 years' experience",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop"
  },
  {
    name: "Dr. Chidinma Eze",
    department: "Gynecology",
    specialty: "Gynecologist",
    experience: "11 years' experience",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop"
  },
  {
    name: "Dr. David Musa",
    department: "Dermatology",
    specialty: "Dermatologist",
    experience: "8 years' experience",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop"
  },
  {
    name: "Dr. Kemi Afolayan",
    department: "Orthopedics",
    specialty: "Orthopedic Specialist",
    experience: "10 years' experience",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop"
  }
];

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function getBookings() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function generateReference() {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return 'CP-' + Date.now().toString(36).toUpperCase() + '-' + randomPart;
}

function formatDate(dateString) {
  if (!dateString) return 'Not provided';

  const parts = dateString.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function displayDoctors() {
  const container = document.getElementById('doctorCards');

  if (!container) return;

  container.innerHTML = doctors.map(doctor => `
    <div class="col-md-6 col-lg-4">
      <div class="doctor-card">
        <img src="${escapeHTML(doctor.image)}" alt="${escapeHTML(doctor.name)}" />
        <div class="doctor-body">
          <span class="doctor-specialty">${escapeHTML(doctor.department)}</span>
          <h5 class="fw-bold mt-3">${escapeHTML(doctor.name)}</h5>
          <p>${escapeHTML(doctor.specialty)}</p>
          <p>${escapeHTML(doctor.experience)}</p>
          <a href="book.html?department=${encodeURIComponent(doctor.department)}" class="btn btn-outline-primary rounded-pill btn-sm">
            Book Appointment →
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function setupBookingForm() {
  const form = document.getElementById('bookingForm');

  if (!form) return;

  const nameInput = document.getElementById('patientName');
  const phoneInput = document.getElementById('phone');
  const departmentSelect = document.getElementById('department');
  const doctorSelect = document.getElementById('doctor');
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  dateInput.min = today;

  function updateDoctors(selectedDoctor = '') {
    const matchingDoctors = doctors.filter(
      doctor => doctor.department === departmentSelect.value
    );

    doctorSelect.innerHTML = '<option value="">Choose doctor</option>' + matchingDoctors.map(doctor => `
      <option value="${escapeHTML(doctor.name)}">${escapeHTML(doctor.name)} — ${escapeHTML(doctor.specialty)}</option>
    `).join('');

    doctorSelect.disabled = matchingDoctors.length === 0;

    if (matchingDoctors.some(doctor => doctor.name === selectedDoctor)) {
      doctorSelect.value = selectedDoctor;
    }
  }

  departmentSelect.addEventListener('change', () => {
    updateDoctors();
  });

  const params = new URLSearchParams(window.location.search);
  const requestedDepartment = params.get('department');

  if ([...departmentSelect.options].some(option => option.value === requestedDepartment && requestedDepartment)) {
    departmentSelect.value = requestedDepartment;
    updateDoctors();
  }

  phoneInput.addEventListener('input', () => {
    phoneInput.setCustomValidity('');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const digits = phoneInput.value.replace(/\D/g, '');
    const validPhone = /^(?:(?:234|0)?[789][01]\d{8})$/.test(digits);

    phoneInput.setCustomValidity(validPhone ? '' : 'Enter a valid Nigerian mobile number.');
    dateInput.setCustomValidity(
      dateInput.value && dateInput.value < today ? 'Choose today or a future date.' : ''
    );

    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      form.querySelector(':invalid')?.focus();
      return;
    }

    const booking = {
      reference: generateReference(),
      patientName: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      department: departmentSelect.value,
      doctor: doctorSelect.value,
      date: dateInput.value,
      time: timeSelect.value,
      createdAt: new Date().toISOString()
    };

    try {
      const bookings = getBookings();
      bookings.unshift(booking);
      saveBookings(bookings);
      sessionStorage.setItem('carepointLatestBooking', JSON.stringify(booking));
      window.location.href = 'confirmation.html';
    } catch (error) {
      const alertBox = document.getElementById('formAlert');
      alertBox.textContent = 'Your browser could not save the booking. Please check your browser storage settings and try again.';
      alertBox.className = 'alert alert-danger';
    }
  });
}

function displayConfirmation() {
  const container = document.getElementById('confirmationContent');

  if (!container) return;

  let booking = null;

  try {
    booking = JSON.parse(sessionStorage.getItem('carepointLatestBooking') || 'null');
  } catch (error) {
    booking = null;
  }

  if (!booking) {
    booking = getBookings()[0] || null;
  }

  if (!booking) {
    container.innerHTML = `
      <div class="alert alert-info">
        No recent booking was found.
        <a href="book.html">Create an appointment</a>.
      </div>
    `;
    return;
  }

  const details = [
    ['Booking Reference', booking.reference],
    ['Patient Name', booking.patientName],
    ['Phone Number', booking.phone],
    ['Department', booking.department],
    ['Doctor', booking.doctor],
    ['Appointment Date', formatDate(booking.date)],
    ['Appointment Time', booking.time]
  ];

  container.innerHTML = details.map(([label, value], index) => `
    <div class="d-flex justify-content-between gap-3 py-3 border-bottom">
      <span class="text-secondary">${escapeHTML(label)}</span>
      <strong class="text-end ${index === 0 ? 'booking-reference' : ''}">${escapeHTML(value)}</strong>
    </div>
  `).join('');
}

function displayBookings() {
  const container = document.getElementById('bookingsList');

  if (!container) return;

  const bookings = getBookings();

  if (bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="display-4 text-primary mb-3">▦</div>
        <h4>No bookings yet</h4>
        <p class="text-secondary">Your saved appointments will appear here.</p>
        <a href="book.html" class="btn btn-primary rounded-pill px-4">Book an Appointment</a>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(booking => `
    <div class="booking-item">
      <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start gap-3">
        <div>
          <span class="doctor-specialty">${escapeHTML(booking.department)}</span>
          <h5 class="mt-3">${escapeHTML(booking.doctor)}</h5>
          <p>Patient: ${escapeHTML(booking.patientName)}</p>
          <p>Phone: ${escapeHTML(booking.phone)}</p>
          <p>Date: ${escapeHTML(formatDate(booking.date))}</p>
          <p>Time: ${escapeHTML(booking.time)}</p>
          <p>
            Reference:
            <span class="booking-reference">${escapeHTML(booking.reference)}</span>
          </p>
        </div>
        <button type="button" class="delete-button" data-reference="${escapeHTML(booking.reference)}">
          Remove Booking
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', () => {
      const confirmed = window.confirm('Do you want to remove this saved booking?');

      if (!confirmed) return;

      const updatedBookings = getBookings().filter(
        booking => booking.reference !== button.dataset.reference
      );

      saveBookings(updatedBookings);
      displayBookings();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  displayDoctors();
  setupBookingForm();
  displayConfirmation();
  displayBookings();
});
