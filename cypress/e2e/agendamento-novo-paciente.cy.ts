const novoPaciente = {
  cpf: '269.124.755-40',
  fullName: 'Adriana Marli Maitê Duarte',
  birthDate: '1990-05-07',
  email: 'adriana_duarte@nogueiramoura.com.br',
  phone: '(12) 99888-9536',
  reason: 'Motivo da consulta de teste para novo paciente.',
  password: 'x3yggTgpqx',
  confirmPassword: 'x3yggTgpqx',
};

describe('Jornada de Agendamento - Novo Paciente', () => {
  it('deve permitir que um novo paciente agende a primeira consulta', () => {
    cy.visit('/');
    cy.log('Página inicial visitada.');

    // Interceta a chamada à API ANTES da ação que a despoleta
    cy.intercept('GET', '/api/bookable-slots*', {
      statusCode: 200,
      body: [
        { id: "slot1", startDateTime: new Date('2025-11-06T09:00:00.000Z') }, // Slot para 6 de Novembro de 2025
        { id: "slot2", startDateTime: new Date('2025-11-06T10:00:00.000Z') }, // Outro slot para 6 de Novembro de 2025
      ],
    }).as('getBookableSlots');
    cy.log('API bookable-slots interceptada.');
    cy.contains('Agendar Consulta').click();
    cy.screenshot('after-agendar-consulta-click');
    cy.log('Botão Agendar Consulta clicado. Verificando se o modal abriu...');
    cy.wait('@getBookableSlots'); // Espera a interceptação ser concluída

    // Esperar o modal de agendamento aparecer e o calendário carregar
    cy.log('Verificando visibilidade do modal de agendamento...');
    cy.contains('Selecione a Data e Hora:', { timeout: 10000 }).should('be.visible');
    cy.log('Modal de agendamento visível.');
    cy.get('.rdp').should('be.visible'); // Espera o calendário ser visível

    cy.get('.rdp-nav_button_next').click(); // Clica no botão para avançar o mês
    cy.get('.rdp-day:not(.rdp-day_disabled)').contains('6').click();
    cy.get('[data-cy="time-slot"]').first().click();
    cy.contains('Próximo').click();

    cy.get('input[name="cpf"]').type(novoPaciente.cpf);
    cy.get('input[name="fullName"]').type(novoPaciente.fullName);
    cy.get('input[name="birthDate"]').type(novoPaciente.birthDate);
    cy.get('input[name="email"]').type(novoPaciente.email);
    cy.get('input[name="phone"]').type(novoPaciente.phone);
    cy.get('textarea[name="reason"]').type(novoPaciente.reason);
    cy.get('input[name="password"]').type(novoPaciente.password);
    cy.get('input[name="confirmPassword"]').type(novoPaciente.confirmPassword);

    cy.get('button[type="submit"]').contains('Agendar Consulta').click();
    cy.contains('Agendamento realizado com sucesso!').should('be.visible');
  });
});