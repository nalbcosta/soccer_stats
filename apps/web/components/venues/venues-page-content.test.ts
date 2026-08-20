import { describe, expect, it } from "vitest";
import { buildVenueAddress, canSubmitVenueForm, venueFormToChanges, type VenueFormState } from "./venues-page-content";

const completeForm: VenueFormState = {
  name: "Arena Camisa 10",
  postalCode: "49050-140",
  addressNumber: "55",
  street: "Rua C de Almeida",
  neighborhood: "Pereira Lobo",
  city: "Aracaju",
  state: "SE",
  surface: "synthetic",
  latitude: "-10.92",
  longitude: "-37.07",
  contactPhone: "79 99998-2198",
  price60: "150",
  price90: "180",
  price120: "200"
};

describe("formulário de campos", () => {
  it("monta o endereço completo a partir do CEP e número", () => {
    expect(buildVenueAddress(completeForm)).toBe("Rua C de Almeida, 55 - Pereira Lobo, Aracaju - SE, 49050-140");
  });

  it("não aceita o formulário antes de resolver um CEP válido", () => {
    expect(canSubmitVenueForm({ ...completeForm, postalCode: "49050" })).toBe(false);
    expect(canSubmitVenueForm(completeForm)).toBe(true);
  });

  it("converte preços para centavos e mantém coordenadas automáticas", () => {
    expect(venueFormToChanges(completeForm)).toMatchObject({
      postalCode: "49050-140",
      addressNumber: "55",
      latitude: -10.92,
      longitude: -37.07,
      prices: { minutes60: 15000, minutes90: 18000, minutes120: 20000 }
    });
  });
});
