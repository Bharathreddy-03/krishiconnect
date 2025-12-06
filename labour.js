// ===== Helpers =====
function kcGetVacancies() {
  const data = localStorage.getItem('kc_vacancies');
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

function kcGetLabourProfile() {
  const data = localStorage.getItem('kc_labour_profile');
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}
function kcSaveLabourProfile(p) {
  localStorage.setItem('kc_labour_profile', JSON.stringify(p));
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
  const labourProfileForm = document.getElementById('labourProfileForm');
  const labourProfileStatus = document.getElementById('labourProfileStatus');
  const labourProfileSavedMsg = document.getElementById('labourProfileSavedMsg');
  const viewLabourProfileBtn = document.getElementById('viewLabourProfile');
  const labourProfileView = document.getElementById('labourProfileView');

  const searchBtn = document.getElementById('searchBtn');
  const searchCityInput = document.getElementById('searchCity');
  const vacancyList = document.getElementById('vacancyList');
  const noDataMessage = document.getElementById('noDataMessage');

  const labourAppsContainer = document.getElementById('labourApplications');
  const labourNoAppsMessage = document.getElementById('labourNoAppsMessage');

  // Load labour profile
  const existingProfile = kcGetLabourProfile();
  if (existingProfile) {
    document.getElementById('lpName').value = existingProfile.name || '';
    document.getElementById('lpCity').value = existingProfile.city || '';
    document.getElementById('lpSkills').value = existingProfile.skills || '';
    document.getElementById('lpExperience').value = existingProfile.experience || '';
    document.getElementById('lpContact').value = existingProfile.contact || '';

    labourProfileStatus.textContent = 'Profile saved';
    labourProfileStatus.classList.remove('secondary');
    labourProfileStatus.classList.add('success');

    if (existingProfile.city && !searchCityInput.value) {
      searchCityInput.value = existingProfile.city;
    }
  }

  // Save labour profile
  labourProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const profile = {
      name: document.getElementById('lpName').value.trim(),
      city: document.getElementById('lpCity').value.trim(),
      skills: document.getElementById('lpSkills').value.trim(),
      experience: document.getElementById('lpExperience').value.trim(),
      contact: document.getElementById('lpContact').value.trim()
    };

    if (!profile.name || !profile.city || !profile.contact) {
      alert('Please fill all required profile fields.');
      return;
    }

    kcSaveLabourProfile(profile);

    labourProfileStatus.textContent = 'Profile saved';
    labourProfileStatus.classList.remove('secondary');
    labourProfileStatus.classList.add('success');

    labourProfileSavedMsg.style.display = 'block';
    setTimeout(() => { labourProfileSavedMsg.style.display = 'none'; }, 2500);

    if (profile.city && !searchCityInput.value) {
      searchCityInput.value = profile.city;
    }

    renderLabourApplications();
  });

  // View labour profile
  viewLabourProfileBtn.addEventListener('click', () => {
    const lp = kcGetLabourProfile();
    if (!lp) {
      alert('Please save your profile first.');
      return;
    }

    labourProfileView.innerHTML = `
      <strong>My Labour Profile</strong><br>
      Name: ${lp.name}<br>
      City: ${lp.city}<br>
      Skills: ${lp.skills || 'No skills added'}<br>
      Experience: ${lp.experience ? lp.experience + ' years' : 'No experience added'}<br>
      Contact: ${lp.contact}
    `;
    labourProfileView.style.display =
      labourProfileView.style.display === 'none' || labourProfileView.style.display === ''
        ? 'block'
        : 'none';
  });

  // Render vacancies
  function renderVacancies(cityFilter = '') {
    vacancyList.innerHTML = '';
    const vacancies = kcGetVacancies();

    let filtered = vacancies;
    if (cityFilter.trim() !== '') {
      const cityLower = cityFilter.trim().toLowerCase();
      filtered = vacancies.filter(v =>
        v.location && v.location.toLowerCase().includes(cityLower)
      );
    }

    if (filtered.length === 0) {
      noDataMessage.style.display = 'block';
      return;
    }
    noDataMessage.style.display = 'none';

    filtered.forEach(v => {
      const card = document.createElement('div');
      card.className = 'vacancy-card';

      const header = document.createElement('div');
      header.className = 'vacancy-header';

      const title = document.createElement('div');
      title.className = 'vacancy-title';
      title.textContent = `${v.workType || 'Work'} – ${v.numWorkers || 0} worker(s) needed`;

      const pill = document.createElement('span');
      pill.className = 'vacancy-pill';
      pill.textContent = `v.date ? ${v.date} : 'Flexible date'`;

      header.appendChild(title);
      header.appendChild(pill);

      const loc = document.createElement('div');
      loc.className = 'vacancy-meta';
      loc.textContent = `📍 Location: ${v.location || 'Not specified'}`;

      const notesDiv = document.createElement('div');
      notesDiv.className = 'vacancy-meta';
      notesDiv.textContent = `v.notes ? 📝 ${v.notes} : '📝 No extra details'`;

      const fp = v.farmerProfile || { name: 'Unknown', city: 'N/A' };
      const farmerShort = document.createElement('div');
      farmerShort.className = 'vacancy-meta';
      farmerShort.textContent =` 👨‍🌾 Farmer: ${fp.name} (${fp.city})`;

      const actions = document.createElement('div');
      actions.className = 'vacancy-actions';

      const viewProfileBtn = document.createElement('button');
      viewProfileBtn.type = 'button';
      viewProfileBtn.className = 'secondary-btn';
      viewProfileBtn.textContent = 'View Farmer Profile';

      const applyBtn = document.createElement('button');
      applyBtn.type = 'button';
      applyBtn.className = 'secondary-btn';
      applyBtn.textContent = 'Apply for this Job';

      const profileBox = document.createElement('div');
      profileBox.className = 'farmer-profile-box';
      profileBox.style.display = 'none';

      profileBox.innerHTML = `
        <strong>Farmer Profile</strong><br>
        Name: ${fp.name}<br>
        City: ${fp.city}<br>
        Contact: ${fp.contact || 'N/A'}<br>
        Experience: ${fp.experience ? fp.experience + ' years' : 'Not specified'}
      `;

      viewProfileBtn.addEventListener('click', () => {
        profileBox.style.display =
          profileBox.style.display === 'none' || profileBox.style.display === ''
            ? 'block'
            : 'none';
      });

      applyBtn.addEventListener('click', () => {
        const lp = kcGetLabourProfile();
        if (!lp) {
          alert('Please save your labour profile before applying.');
          return;
        }

        const apps = kcGetApplications();
        const already = apps.some(a =>
          a.vacancyId === v.id &&
          a.labourProfile &&
          a.labourProfile.contact === lp.contact
        );
        if (already) {
          alert('You have already applied for this vacancy.');
          return;
        }

        const app = {
          id: Date.now(),
          vacancyId: v.id,
          vacancySummary: {
            workType: v.workType,
            location: v.location
          },
          farmerProfile: v.farmerProfile || null,
          labourProfile: {
            name: lp.name,
            city: lp.city,
            skills: lp.skills,
            experience: lp.experience,
            contact: lp.contact
          },
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        apps.push(app);
        kcSaveApplications(apps);

        alert('✅ Applied successfully! The farmer will see your application.');
        renderLabourApplications();
      });

      actions.appendChild(viewProfileBtn);
      actions.appendChild(applyBtn);

      card.appendChild(header);
      card.appendChild(loc);
      card.appendChild(notesDiv);
      card.appendChild(farmerShort);
      card.appendChild(actions);
      card.appendChild(profileBox);

      vacancyList.appendChild(card);
    });
  }

  // Render labour applications
  function renderLabourApplications() {
    labourAppsContainer.innerHTML = '';

    const lp = kcGetLabourProfile();
    if (!lp) {
      labourNoAppsMessage.textContent = 'Save your profile and apply to vacancies to see them here.';
      labourNoAppsMessage.style.display = 'block';
      return;
    }

    const apps = kcGetApplications();
    const myApps = apps.filter(a =>
      a.labourProfile && a.labourProfile.contact === lp.contact
    );

    if (myApps.length === 0) {
      labourNoAppsMessage.textContent = 'You have not applied to any vacancies yet.';
      labourNoAppsMessage.style.display = 'block';
      return;
    }

    labourNoAppsMessage.style.display = 'none';

    myApps.forEach(app => {
      const farmer = app.farmerProfile || {};

      const card = document.createElement('div');
      card.className = 'vacancy-card';

      const header = document.createElement('div');
      header.className = 'vacancy-header';

      const title = document.createElement('div');
      title.className = 'vacancy-title';
      title.textContent = `${app.vacancySummary.workType} (${app.vacancySummary.location})`;

      const pill = document.createElement('span');
      pill.className = 'vacancy-pill';
      pill.textContent = app.status === 'accepted' ? '✅ Accepted' : '⏳ Pending';

      header.appendChild(title);
      header.appendChild(pill);

      const farmerInfo = document.createElement('div');
      farmerInfo.className = 'vacancy-meta';
      farmerInfo.textContent = `👨‍🌾 Farmer: ${farmer.name || 'N/A'} (${farmer.city || 'N/A'})`;

      const contact = document.createElement('div');
      contact.className = 'vacancy-meta';
      contact.textContent =` 📞 Contact: ${farmer.contact || 'N/A'}`;

      const actions = document.createElement('div');
      actions.className = 'vacancy-actions';

      const chatBtn = document.createElement('button');
      chatBtn.type = 'button';
      chatBtn.className = 'secondary-btn';
      chatBtn.textContent = 'Open Chat';
      chatBtn.addEventListener('click', () => {
        window.location.href = `chat.html?applicationId=${app.id}&role=labour`;
      });

      actions.appendChild(chatBtn);

      card.appendChild(header);
      card.appendChild(farmerInfo);
      card.appendChild(contact);
      card.appendChild(actions);

      labourAppsContainer.appendChild(card);
    });
  }

  // Initial renders
  renderVacancies(searchCityInput.value || '');
  renderLabourApplications();

  searchBtn.addEventListener('click', () => {
    renderVacancies(searchCityInput.value);
  });
});