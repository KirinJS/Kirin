package com.futureplatforms.kirin.generated.demo.hellokirin;
 
 
public interface IDumbButtonScreen {
 
    /**
     * @param size {@link int}
     * @param text {@link String}
     */
    void updateLabelSizeAndText(int size, String text);
 
    /**
     * @param finalLabel {@link String}
     */
    void changeScreen(String finalLabel);
}