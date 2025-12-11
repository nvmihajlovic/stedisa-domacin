import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3',
  },
})

const emailStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #F8F9FA;
    margin: 0;
    padding: 40px 20px;
  }
  .container {
    max-width: 580px;
    margin: 0 auto;
    background: #FFFFFF;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  .header {
    padding: 48px 48px 36px;
    background: #FFFFFF;
    border-bottom: 1px solid #E5E7EB;
  }
  .brand {
    font-size: 28px;
    font-weight: 600;
    color: #111827;
    letter-spacing: -0.03em;
    margin: 0;
  }
  .content {
    padding: 48px;
  }
  .greeting {
    font-size: 15px;
    color: #6B7280;
    margin-bottom: 24px;
    font-weight: 400;
  }
  .title {
    font-size: 22px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
  }
  .text {
    font-size: 15px;
    line-height: 1.6;
    color: #374151;
    margin-bottom: 16px;
  }
  .button-container {
    margin: 36px 0;
    text-align: center;
  }
  .button {
    display: inline-block;
    padding: 14px 32px;
    background: #111827;
    color: #FFFFFF !important;
    text-decoration: none;
    border-radius: 2px;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.01em;
    transition: background 0.2s;
  }
  .note {
    margin-top: 32px;
    padding: 16px;
    background: #F9FAFB;
    border-left: 2px solid #D1D5DB;
    border-radius: 2px;
  }
  .note-text {
    font-size: 13px;
    color: #6B7280;
    line-height: 1.5;
    margin: 0;
  }
  .info-box {
    margin: 32px 0;
    padding: 20px;
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 3px;
  }
  .info-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6B7280;
    margin-bottom: 8px;
  }
  .info-value {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }
  .feature-list {
    margin: 28px 0;
  }
  .feature-item {
    padding: 16px 0;
    border-bottom: 1px solid #F3F4F6;
  }
  .feature-item:last-child {
    border-bottom: none;
  }
  .feature-title {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  .feature-desc {
    font-size: 14px;
    color: #6B7280;
    line-height: 1.5;
  }
  .footer {
    padding: 32px 48px;
    text-align: center;
    border-top: 1px solid #E5E7EB;
    background: #FAFAFA;
  }
  .footer-text {
    font-size: 12px;
    color: #9CA3AF;
    line-height: 1.6;
    margin: 4px 0;
  }
  .warning-note {
    margin-top: 32px;
    padding: 16px;
    background: #FEF2F2;
    border-left: 2px solid #EF4444;
    border-radius: 2px;
  }
  .warning-note-text {
    font-size: 13px;
    color: #991B1B;
    line-height: 1.5;
    margin: 0;
  }
  .success-note {
    margin-top: 32px;
    padding: 16px;
    background: #F0FDF4;
    border-left: 2px solid #10B981;
    border-radius: 2px;
  }
  .success-note-text {
    font-size: 13px;
    color: #065F46;
    line-height: 1.5;
    margin: 0;
  }
`

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  const mailOptions = {
    from: `"Domaćin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Potvrdite vašu email adresu',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${emailStyles}</style></head><body><div class="container"><div class="header"><h1 class="brand">Domaćin</h1></div><div class="content"><p class="greeting">Zdravo, ${name}</p><h2 class="title">Potvrdite vašu email adresu</h2><p class="text">Dobrodošli u Domaćin – vašu aplikaciju za kontrolu finansija.</p><p class="text">Da biste nastavili, molimo vas da potvrdite vašu email adresu klikom na dugme ispod:</p><div class="button-container"><a href="${verificationUrl}" class="button">Potvrdi email adresu</a></div><div class="note"><p class="note-text">Ovaj link je validan 24 sata od trenutka slanja. Ako niste kreirali nalog, molimo vas da ignorišete ovaj email.</p></div></div><div class="footer"><p class="footer-text">© 2025 Domaćin. Sva prava zadržana.</p><p class="footer-text">Ovo je automatski generisan email.</p></div></div></body></html>`,
    text: `Zdravo, ${name}!\n\nDobrodošli u Domaćin – vašu aplikaciju za kontrolu finansija!\n\nMolimo vas da potvrdite vašu email adresu klikom na link ispod:\n${verificationUrl}\n\nNapomena: Ovaj link je validan 24 sata od trenutka slanja.\n\nAko niste kreirali nalog, samo ignorišite ovaj email.\n\n© 2025 Domaćin. Sva prava zadržana.`,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log(`✓ Verification email sent to: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('✗ Error sending verification email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: `"Domaćin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Dobrodošli u Domaćin',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${emailStyles}</style></head><body><div class="container"><div class="header"><h1 class="brand">Domaćin</h1></div><div class="content"><p class="greeting">Zdravo, ${name}</p><h2 class="title">Dobrodošli u Domaćin</h2><p class="text">Vaš nalog je uspešno verifikovan i spreman za korišćenje.</p><p class="text">Sada možete započeti praćenje svojih finansija kroz sledeće funkcionalnosti:</p><div class="feature-list"><div class="feature-item"><div class="feature-title">Praćenje troškova i prihoda</div><div class="feature-desc">Evidentirajte sve finansijske transakcije na jednom mestu</div></div><div class="feature-item"><div class="feature-title">Analiza statistika</div><div class="feature-desc">Pratite svoje navike potrošnje kroz vizuelne grafike</div></div><div class="feature-item"><div class="feature-title">Ponavljajuća plaćanja</div><div class="feature-desc">Automatizujte evidenciju redovnih računa</div></div><div class="feature-item"><div class="feature-title">Grupne finansije</div><div class="feature-desc">Delite troškove sa porodicom ili prijateljima</div></div></div><div class="button-container"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Idite na Dashboard</a></div><div class="note"><p class="note-text">Ako imate bilo kakvih pitanja ili trebate pomoć, slobodno nas kontaktirajte.</p></div></div><div class="footer"><p class="footer-text">© 2025 Domaćin. Sva prava zadržana.</p><p class="footer-text">Ovo je automatski generisan email.</p></div></div></body></html>`,
    text: `Zdravo, ${name}!\n\nDobrodošli u Domaćin!\n\nVaš nalog je uspešno verifikovan i spreman za korišćenje.\n\nSada možete da:\n• Pratite troškove i prihode\n• Analizirajte statistike\n• Automatizujete ponavljajuće plaćanja\n• Delite troškove u grupama\n\nPosetite: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\nPrijatno korišćenje!\n\n© 2025 Domaćin. Sva prava zadržana.`,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log(`✓ Welcome email sent to: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('✗ Error sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendGroupInviteEmail(email: string, inviterName: string, groupName: string, token: string, userExists: boolean) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/group/join?token=${token}`
  const featuresHTML = !userExists ? `<p class="text">Domaćin vam omogućava da:</p><div class="feature-list"><div class="feature-item"><div class="feature-title">Pratite zajedničke troškove</div><div class="feature-desc">Evidentirajte ko je platio i koliko duguje</div></div><div class="feature-item"><div class="feature-title">Automatsko poravnanje</div><div class="feature-desc">Sistem automatski izračunava dugovanja između članova</div></div><div class="feature-item"><div class="feature-title">Transparentnost</div><div class="feature-desc">Svi članovi imaju uvid u troškove grupe</div></div></div>` : ''
  const mailOptions = {
    from: `"Domaćin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: userExists ? `${inviterName} vas poziva u grupu "${groupName}"` : `${inviterName} vas poziva da se pridružite aplikaciji Domaćin`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${emailStyles}</style></head><body><div class="container"><div class="header"><h1 class="brand">Domaćin</h1></div><div class="content"><p class="greeting">Zdravo</p><h2 class="title">Pozivnica za grupu</h2><p class="text"><strong>${inviterName}</strong> vas poziva da se pridružite grupi na aplikaciji Domaćin.</p><div class="info-box"><div class="info-label">Naziv grupe</div><div class="info-value">${groupName}</div></div>${featuresHTML}<p class="text">${userExists ? 'Kliknite na dugme ispod kako biste prihvatili pozivnicu:' : 'Prvo se registrujte, a zatim ćete automatski biti pridruženi grupi:'}</p><div class="button-container"><a href="${inviteUrl}" class="button">${userExists ? 'Prihvati pozivnicu' : 'Registruj se i pridruži'}</a></div><div class="note"><p class="note-text">Pozivnica važi 7 dana. Ako niste zatražili ovaj poziv, ignorišite ovaj email.</p></div></div><div class="footer"><p class="footer-text">© 2025 Domaćin. Sva prava zadržana.</p><p class="footer-text">Ovo je automatski generisan email.</p></div></div></body></html>`,
    text: `Poziv za pridruživanje grupi "${groupName}"\n\n${inviterName} vas poziva da se pridružite grupi na aplikaciji Domaćin.\n\n${userExists ? `Prihvatite pozivnicu na: ${inviteUrl}` : `Registrujte se i automatski ćete biti pridruženi grupi: ${inviteUrl}`}\n\nPozivnica važi 7 dana.\n\n© 2025 Domaćin. Sva prava zadržana.`,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log(`✓ Group invite email sent to: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('✗ Error sending group invite email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  const mailOptions = {
    from: `"Domaćin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Resetovanje lozinke',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${emailStyles}</style></head><body><div class="container"><div class="header"><h1 class="brand">Domaćin</h1></div><div class="content"><p class="greeting">Zdravo, ${name}</p><h2 class="title">Resetovanje lozinke</h2><p class="text">Primili smo zahtev za resetovanje vaše lozinke.</p><p class="text">Kliknite na dugme ispod da biste kreirali novu lozinku:</p><div class="button-container"><a href="${resetUrl}" class="button">Resetuj lozinku</a></div><div class="warning-note"><p class="warning-note-text"><strong>Važno:</strong> Ovaj link je validan samo 30 minuta i može se koristiti samo jednom.</p></div><div class="note"><p class="note-text"><strong>Niste tražili resetovanje lozinke?</strong><br>Ako niste Vi poslali ovaj zahtev, ignorišite ovaj email. Vaša trenutna lozinka ostaje nepromenjena.</p></div></div><div class="footer"><p class="footer-text">© 2025 Domaćin. Sva prava zadržana.</p><p class="footer-text">Ovo je automatski generisan email.</p></div></div></body></html>`,
    text: `Zdravo, ${name}!\n\nPrimili smo zahtev za resetovanje vaše lozinke.\n\nKliknite na link ispod da biste kreirali novu lozinku:\n${resetUrl}\n\nVANO: Ovaj link je validan samo 30 minuta i može se koristiti samo jednom.\n\nNiste tražili resetovanje lozinke?\nAko niste Vi poslali ovaj zahtev, ignorišite ovaj email.\nVaša trenutna lozinka ostaje nepromenjena.\n\n© 2025 Domaćin. Sva prava zadržana.`,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log(`✓ Password reset email sent to: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('✗ Error sending password reset email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordChangedEmail(email: string, name: string) {
  const mailOptions = {
    from: `"Domaćin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Lozinka je promenjena',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${emailStyles}</style></head><body><div class="container"><div class="header"><h1 class="brand">Domaćin</h1></div><div class="content"><p class="greeting">Zdravo, ${name}</p><h2 class="title">Lozinka je promenjena</h2><div class="success-note"><p class="success-note-text"><strong>✓ Uspešno</strong><br>Vaša lozinka je promenjena.</p></div><p class="text">Ovo je potvrda da je lozinka za vaš Domaćin nalog upravo promenjena.</p><p class="text">Sada možete da se prijavite koristeći novu lozinku.</p><div class="warning-note"><p class="warning-note-text"><strong>Niste Vi promenili lozinku?</strong><br>Ako niste Vi inicirali ovu promenu, molimo vas da odmah kontaktirate našu podršku i resetujete lozinku ponovo.</p></div></div><div class="footer"><p class="footer-text">© 2025 Domaćin. Sva prava zadržana.</p><p class="footer-text">Ovo je automatski generisan email.</p></div></div></body></html>`,
    text: `Zdravo, ${name}!\n\n✓ Vaša lozinka je uspešno promenjena\n\nOvo je potvrda da je lozinka za vaš Domaćin nalog upravo promenjena.\n\nSada možete da se prijavite koristeći novu lozinku.\n\nNiste Vi promenili lozinku?\nAko niste Vi inicirali ovu promenu, molimo vas da odmah kontaktirate našu podršku i resetujete lozinku ponovo.\n\n© 2025 Domaćin. Sva prava zadržana.`,
  }
  try {
    await transporter.sendMail(mailOptions)
    console.log(`✓ Password changed confirmation email sent to: ${email}`)
    return { success: true }
  } catch (error) {
    console.error('✗ Error sending password changed email:', error)
    return { success: false, error }
  }
}
