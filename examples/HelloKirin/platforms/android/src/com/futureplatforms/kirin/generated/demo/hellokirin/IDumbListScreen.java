package com.futureplatforms.kirin.generated.demo.hellokirin;
 
import org.json.JSONArray;
 
/**
 * This screen looks after a list
 */
public interface IDumbListScreen {
 
    /**
     * @param list {@link JSONArray}
     */
    void populateList(JSONArray list);
 
    /**
     * @param toast {@link String}
     */
    void showToast(String toast);
}