/// <reference types="cypress" />
// @ts-check

describe("Client UI", () => {
  describe("About tab", () => {
    it("Loads the client application", () => {
      cy.visit("http://energygrid.localhost:8000/");
      cy.contains("EnergyNode");
    });
  });

  describe("Tokens tab", () => {
    it("Shows the correct initial number of tokens", () => {
      cy.get('button:contains("Tokens")').click();
      cy.get("#token-count").should("have.text", 0);
    });

    it("Should update the token count when tokens are purchased", () => {
      cy.get('button:contains("Buy tokens")').click();
      cy.get("#token-count").should("have.text", 50);
    });
  });
});
