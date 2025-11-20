describe('Calculator UI', () => {
  it('carga la página principal', () => {
    cy.visit('http://localhost:8081');
    cy.get('body').should('exist');
  });
});
