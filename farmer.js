// ===== Helpers =====
function kcGetFarmerProfile() {
  const data = localStorage.getItem('kc_farmer_profile');
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}
function kcSaveFarmerProfile(p) {
  localStorage.setItem('kc_farmer_profile', JSON.stringify(p));
}

function kcGetVacancies() {
  const data = localStorage.getItem('kc_vacancies');
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}
function kcSaveVacancies(list) {
  localStorage.setItem('kc_vacancies', JSON.stringify(list));
}

function kcGetApplications() {
  const data = localStorage.getItem('kc_applications');
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}
function kcSaveApplications(list) {
  localStorage.setItem('kc_applications', JSON.stringify(list));
}

// ===== Main =====
document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('farmerProfileForm');
  const profileStatus = document.getElementById('profileStatus');
  const profileSavedMsg = document.getElementById('profileSavedMsg');
  const viewFarmerProfileBtn = document.getElementById('viewFarmerProfile');
  const farmerProfileView = document.getElementById('farmerProfileView');

  const vacancyForm = document.getElementById('farmerVacancyForm');
  const vacancySuccessMessage = document.getElementById('vacancySuccessMessage');
  const locationInput = document.getElementById('location');

  const appsContainer = document.getElementById('farmerApplications');
  const noAppsMessage = document.getElementById('farmerNoAppsMessage');

  // Load profile if exists
  const existingProfile = kcGetFarmerProfile();
  if (existingProfile) {
    document.getElementById('fpName').value = existingProfile.name || '';
    document.getElementById('fpCity').value = existingProfile.city || '';
    document.getElementById('fpContact').value = existingProfile.contact || '';
    document.getElementById('fpExperience').value = existingProfile.experience || '';

    profileStatus.textContent = 'Profile saved';
    profileStatus.classList.remove('secondary');
    profileStatus.classList.add('success');

    if (existingProfile.city && !locationInput.value) {
      locationInput.value = existingProfile.city;
    }
  }

  // Save profile
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const profile = {
      name: document.getElementById('fpName').value.trim(),
      city: document.getElementById('fpCity').value.trim(),
      contact: document.getElementById('fpContact').value.trim(),
      experience: document.getElementById('fpExperience').value.trim()
    };

    if (!profile.name || !profile.city || !profile.contact) {
      alert('Please fill all required profile fields.');
      return;
    }

    kcSaveFarmerProfile(profile);

    profileStatus.textContent = 'Profile saved';
    profileStatus.classList.remove('secondary');
    profileStatus.classList.add('success');

    profileSavedMsg.style.display = 'block';
    setTimeout(() => { profileSavedMsg.style.display = 'none'; }, 2500);

    if (profile.city && !locationInput.value) {
      locationInput.value = profile.city;
    }

    renderFarmerApplications();
  });

  // View my profile
  viewFarmerProfileBtn.addEventListener('click', () => {
    const fp = kcGetFarmerProfile();
    if (!fp) {
      alert('Please save your profile first.');
      return;
    }
    farmerProfileView.innerHTML = `
      <strong>My Farmer Profile</strong><br>
      Name: ${fp.name}<br>
      City: ${fp.city}<br>
      Contact: ${fp.contact}<br>
      Experience: ${fp.experience ? fp.experience + ' years' : 'Not specified'}
    `;
    farmerProfileView.style.display =
      farmerProfileView.style.display === 'none' || farmerProfileView.style.display === ''
        ? 'block'
        : 'none';
  });

  // Post vacancy
  vacancyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const workType = document.getElementById('workType').value;
    const numWorkers = document.getElementById('numWorkers').value;
    const loc = document.getElementById('location').value.trim();
    const date = document.getElementById('date').value;
    const notes = document.getElementById('notes').value.trim();

    if (!workType || !numWorkers || !loc) {
      alert('Please fill all required vacancy fields.');
      return;
    }

    const fp = kcGetFarmerProfile();
    if (!fp) {
      alert('Please save your farmer profile before posting.');
      return;
    }

    const vacancies = kcGetVacancies();
    const vacancy = {
      id: Date.now(),
      workType,
      numWorkers: parseInt(numWorkers, 10),
      location: loc,
      date: date || null,
      notes,
      createdAt: new Date().toISOString(),
      farmerProfile: {
        name: fp.name,
        city: fp.city,
        contact: fp.contact,
        experience: fp.experience
      }
    };

    vacancies.push(vacancy);
    kcSaveVacancies(vacancies);

    vacancySuccessMessage.style.display = 'block';
    vacancyForm.reset();
    if (fp.city) locationInput.value = fp.city;

    setTimeout(() => { vacancySuccessMessage.style.display = 'none'; }, 2500);
  });

  // Render applications for this farmer
  function renderFarmerApplications() {
    appsContainer.innerHTML = '';

    const fp = kcGetFarmerProfile();
    if (!fp) {
      noAppsMessage.textContent = 'Save your profile to start receiving applications.';
      noAppsMessage.style.display = 'block';
      return;
    }

    const apps = kcGetApplications();
    const myApps = apps.filter(a =>
      a.farmerProfile && a.farmerProfile.contact === fp.contact
    );

    if (myApps.length === 0) {
      noAppsMessage.textContent = 'No applications yet. Labourers will appear here after they apply.';
      noAppsMessage.style.display = 'block';
      return;
    }

    noAppsMessage.style.display = 'none';

    myApps.forEach(app => {
      const labour = app.labourProfile || {};

      const card = document.createElement('div');
      card.className = 'vacancy-card';

      const header = document.createElement('div');
      header.className = 'vacancy-header';

      const title = document.createElement('div');
      title.className = 'vacancy-title';
      title.textContent = `Application for ${app.vacancySummary.workType} (${app.vacancySummary.location})`;

      const pill = document.createElement('span');
      pill.className = 'vacancy-pill';
      pill.textContent = app.status === 'accepted' ? '✅ Accepted' : '⏳ Pending';

      header.appendChild(title);
      header.appendChild(pill);

      const labourInfo = document.createElement('div');
      labourInfo.className = 'vacancy-meta';
      labourInfo.textContent =` 👷 Labour: ${labour.name || 'N/A'} (${labour.city || 'N/A'})`;

      const skills = document.createElement('div');
      skills.className = 'vacancy-meta';
      skills.textContent = `🛠 Skills: ${labour.skills || 'Not specified'}`;

      const contact = document.createElement('div');
      contact.className = 'vacancy-meta';
      contact.textContent = `📞 Contact: ${labour.contact || 'N/A'}`;

      const actions = document.createElement('div');
      actions.className = 'vacancy-actions';

      const chatBtn = document.createElement('button');
      chatBtn.type = 'button';
      chatBtn.className = 'secondary-btn';
      chatBtn.textContent = 'Open Chat';
      chatBtn.addEventListener('click', () => {
        window.location.href = `chat.html?applicationId=${app.id}&role=farmer`;
      });

      const markAcceptedBtn = document.createElement('button');
      markAcceptedBtn.type = 'button';
      markAcceptedBtn.className = 'secondary-btn';
      markAcceptedBtn.textContent = 'Mark as Accepted';
      markAcceptedBtn.addEventListener('click', () => {
        const all = kcGetApplications();
        const index = all.findIndex(x => x.id === app.id);
        if (index !== -1) {
          all[index].status = 'accepted';
          kcSaveApplications(all);
          renderFarmerApplications();
        }
      });

      actions.appendChild(chatBtn);
      actions.appendChild(markAcceptedBtn);

      card.appendChild(header);
      card.appendChild(labourInfo);
      card.appendChild(skills);
      card.appendChild(contact);
      card.appendChild(actions);

      appsContainer.appendChild(card);
    });
  }

  renderFarmerApplications();
});