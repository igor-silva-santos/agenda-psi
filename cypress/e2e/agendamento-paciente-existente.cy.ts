const pacienteExistente = {
  cpf: '269.124.755-40',
  fullName: 'Adriana Marli Maitê Duarte',
  birthDate: '1990-05-07',
  email: 'adriana_duarte@nogueiramoura.com.br',
  phone: '(12) 99888-9536',
};

describe('Jornada de Agendamento - Paciente Existente', () => {
  it('deve preencher os dados automaticamente para um paciente existente', () => {
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

    cy.get('.rdp-nav_button_next').click();
    cy.get('.rdp-day:not(.rdp-day_disabled)').contains('6').click();
    cy.get('[data-cy="time-slot"]').first().click();
    cy.contains('Próximo').click();

    cy.get('input[name="cpf"]').type(pacienteExistente.cpf);
    
    // Verificar se os dados foram preenchidos
    cy.get('input[name="fullName"]').should('have.value', pacienteExistente.fullName);
    cy.get('input[name="birthDate"]').should('have.value', pacienteExistente.birthDate);
    cy.get('input[name="email"]').should('have.value', pacienteExistente.email);
    cy.get('input[name="phone"]').should('have.value', pacienteExistente.phone);

    cy.get('button[type="submit"]').contains('Agendar Consulta').click();
    cy.contains('Agendamento realizado com sucesso!').should('be.visible');
  });
});